import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import Toast from "react-native-root-toast";
import { img_logo } from "./src/asset";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {

    const navigation = useNavigation();

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState<User[]>([])
    const [showToastLoginIncorrect, setShowToastLoginIncorrect] = useState<boolean>(false);

    useEffect(() => {
        if (!showToastLoginIncorrect) return
        const timer = setTimeout(() => {
            setShowToastLoginIncorrect(false)
        }, 1500);
        return () => clearTimeout(timer);
    }, [showToastLoginIncorrect])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseJS = await fetch("https://sheets.googleapis.com/v4/spreadsheets/15PVp4b-CzYKin168fLgUXoUxG88FufMhDFVRCjrcIuo/values/users?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=AIzaSyCJMBXoGgagLBy8OZR4NnhGBs8R2T7e_tw")
                    .then((response) => response.json());
                const list = responseJS.values.map((e: any) => {
                    const object = e.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
                        return { ...previousValue, [responseJS.values[0][currentIndex]]: currentValue }
                    }, {})
                    return object
                })
                setUsers(list)
            } catch (exception) {
                console.error(exception);
            }
        }

        fetchData()
    }, [])

    const handleOnLogin = async () => {
        if (users.filter((e) => e.name == id).length != 0) {
            await storeData(users.filter((e) => e.name == id)[0]);

            navigation.navigate("home");
        } else {
            setShowToastLoginIncorrect(true)
        }
    }


    const storeData = async (value: any) => {
        try {
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem('@storage_Key', jsonValue)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={img_logo} resizeMode={"contain"} />

            <View style={styles.inputView}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Id."
                    placeholderTextColor="#003f5c"
                    onChangeText={(id) => setId(id)}
                />
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Password."
                    placeholderTextColor="#003f5c"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />
            </View>

            <TouchableOpacity>
                <Text style={styles.forgot_button}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleOnLogin}>
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>

            {showToastLoginIncorrect &&
                <Toast
                    visible={true}
                    shadow={false}
                    animation={false}
                    hideOnPress={true}
                >
                    Id and password are not correct!
                </Toast>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },

    image: {
        marginBottom: 40,
        width: 200,
        height: 100
    },
    loginText: {
        color: "white"
    },

    inputView: {
        width: "70%",
        height: 45,
        marginBottom: 20,
        alignItems: "center",
    },

    TextInput: {
        width: "100%",
        backgroundColor: "#FFC0CB",
        borderRadius: 30,
        flex: 1,
        padding: 10,
    },

    forgot_button: {
        height: 30,
        marginBottom: 30,
    },

    loginBtn: {
        width: "80%",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        backgroundColor: "#28648D",
    },
});

interface User {
    name: string;
    passwrod: string;
}
