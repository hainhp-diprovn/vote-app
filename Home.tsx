import React from "react";
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Text, View, Image, Button, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import Carousel from "react-native-reanimated-carousel";
import { withAnchorPoint } from "./anchor-point";
import { ic_check, ic_list, ic_menu, img_logo_2 } from "./src/asset";
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenSize = Dimensions.get('window');
const PAGE_WIDTH = screenSize.width / 1.8;
const PAGE_HEIGHT = Math.min(screenSize.width * 1.2, screenSize.height * 0.5);

const colors = ['#fda282', '#fdba4e', '#800015'];

const sheets = [
    "https://sheet.best/api/sheets/2efea45e-eaa3-4dbb-835b-b8f6ebbe1373/tabs/score", // hai
    "https://sheet.best/api/sheets/0c9a8f71-d975-462a-a0b5-276c9e7882ab/tabs/score", // hien
]

export default function HomeScreen() {

    const [routes, setRoutes] = useState<Repertoire[]>([]);
    const [listSelected, setListSelected] = useState<Repertoire[]>([]);
    const [votedList, setVotedList] = useState<VoteRepertoire[]>([]);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [userLoggin, setUserLoggin] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [indexSheetUsing, setIndexSheetUsing] = useState<number>(0);

    const isVoted = votedList.length != 0;

    useEffect(() => {
        if (!showToast) return
        const timer = setTimeout(() => {
            setShowToast(false)
        }, 1500);
        return () => clearTimeout(timer);
    }, [showToast])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const responseJS = await fetch("https://sheets.googleapis.com/v4/spreadsheets/15PVp4b-CzYKin168fLgUXoUxG88FufMhDFVRCjrcIuo/values/repertoire?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=AIzaSyCJMBXoGgagLBy8OZR4NnhGBs8R2T7e_tw")
                .then((response) => response.json());
            const list = responseJS.values.map((e: any) => {
                const object = e.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
                    return { ...previousValue, [responseJS.values[0][currentIndex]]: currentValue }
                }, {})
                return object
            })
            setRoutes(list.slice(1))

            const scoreReponseJS = await fetch("https://sheets.googleapis.com/v4/spreadsheets/15PVp4b-CzYKin168fLgUXoUxG88FufMhDFVRCjrcIuo/values/score?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=AIzaSyCJMBXoGgagLBy8OZR4NnhGBs8R2T7e_tw")
                .then((response) => response.json());
            const scores = scoreReponseJS.values.map((e: any) => {
                const object = e.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
                    return { ...previousValue, [scoreReponseJS.values[0][currentIndex]]: currentValue }
                }, {})
                return object
            })

            const user = await getSession()
            setUserLoggin(user)

            const listscores = scores as VoteRepertoire[]
            const voted = listscores.filter((e) => e.user_id == user.name)
            setVotedList(voted)
        } catch (exception) {
            console.error(exception);
        }
    }

    const getSession = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@storage_Key')
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error(e)
        }
    }

    const handleSubmitVote = async () => {
        if (isLoading) return
        if (listSelected.length != 2) {
            setShowToast(true)
            return
        }
        const data = {
            user_id: userLoggin.name,
            repertoire_id_1: listSelected[0].id,
            repertoire_id_2: listSelected[1].id
        };
        setIsLoading(true)
        const path = sheets[indexSheetUsing]
        try {
            await fetch(path, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
        } catch (e) {
            setIndexSheetUsing(indexSheetUsing + 1 >= sheets.length ? 0 : indexSheetUsing + 1)
        }
        await fetchData()
        setIsLoading(false)
    }


    return <View
        style={{
            flex: 1,
            alignItems: "center",
            backgroundColor: "white",
        }}>
        <View style={{
            width: "100%",
            height: 50,
            backgroundColor: "white",
            alignItems: "center",
            flexDirection: "row",
            borderBottomWidth: 0.5,
            borderBottomColor: "#33B0D0"
        }}>
            <Image
                resizeMode="contain"
                source={img_logo_2}
                style={{ width: 30, aspectRatio: 1, position: "absolute", left: 16 }}
            />
            <Text style={{ textAlign: "center", flex: 1, fontSize: 20, fontWeight: "bold", color: "#33B0D0" }}>
                <Text style={{ color: "#28648D" }}>Vote</Text> Performance
            </Text>
        </View>
        <Carousel
            loop={false}
            width={PAGE_WIDTH}
            data={routes}
            scrollAnimationDuration={1000}
            style={{
                width: screenSize.width,
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
            }}
            onSnapToItem={(index) => console.log('current index:', index)}
            renderItem={({ item, index, animationValue }) => (
                <Card
                    item={item}
                    animationValue={animationValue}
                    key={index}
                    index={index}
                    isChecked={
                        listSelected.filter((e) => e.id == item.id).length != 0 ||
                        votedList.filter((e) => e.repertoire_id_1 == item.id || e.repertoire_id_2 == item.id).length != 0
                    }
                    isVoted={isVoted}
                    onCheckPress={(item) => {
                        if (listSelected.findIndex((e) => e.id == item.id) == -1) {
                            if (listSelected.length > 1) {
                                setShowToast(true)
                            } else {
                                setListSelected([...listSelected, item])
                            }
                        } else {
                            setListSelected(listSelected.filter((e) => e.id != item.id))
                        }
                    }}
                />
            )}
        />
        <TouchableOpacity
            disabled={isLoading || isVoted}
            onPress={handleSubmitVote}
            style={{
                bottom: 70,
                backgroundColor: isVoted ? "white" : "#28648D",
                borderColor: "#28648D",
                borderWidth: 0.6,
                paddingHorizontal: 30,
                paddingVertical: 12,
                borderRadius: 10,
                flexDirection: "row",
                minWidth: 200,
                justifyContent: "center"
            }}
        >
            {isLoading &&
                <ActivityIndicator
                    size="small"
                    color={"white"}
                    style={{ marginRight: 10 }}
                />
            }
            <Text
                style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: isVoted ? "#28648D" : "white",
                    fontWeight: "bold",
                }}
            >
                {isVoted ? "Voted" : "Submit your choice"}
            </Text>
        </TouchableOpacity>
        {showToast &&
            <Toast
                visible={true}
                shadow={false}
                animation={false}
                hideOnPress={true}
            >
                {listSelected.length == 1 ? "You need vote 2" : "You can only vote for 2 performance!!"}
            </Toast>
        }
    </View>
}

const Card: React.FC<{
    item: Repertoire,
    index: number;
    animationValue: Animated.SharedValue<number>;
    isVoted: boolean;
    isChecked: boolean;
    onCheckPress: (item: Repertoire) => void;
}> = ({ item, index, animationValue, isVoted, isChecked, onCheckPress }) => {
    const WIDTH = PAGE_WIDTH;
    const HEIGHT = PAGE_HEIGHT / 1.5;

    const cardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            animationValue.value,
            [-0.1, 0, 1],
            [0.95, 1, 1],
            Extrapolate.CLAMP
        );

        const translateX = interpolate(
            animationValue.value,
            [-1, -0.2, 0, 1],
            [0, WIDTH * 0.2, 0, 0]
        );

        const transform = {
            transform: [
                { scale },
                { translateX },
                { perspective: 200 },
                {
                    rotateY: `${interpolate(
                        animationValue.value,
                        [-1, 0, 0.4, 1],
                        [30, 0, -25, -25],
                        Extrapolate.CLAMP
                    )}deg`,
                },
            ],
        };

        return {
            ...withAnchorPoint(
                transform,
                { x: 0.5, y: 0.5 },
                { width: WIDTH, height: HEIGHT }
            ),
        };
    }, [index]);

    const blockStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [0, 60, 60]
        );

        const translateY = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [0, -40, -40]
        );

        const rotateZ = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [0, 0, -25]
        );

        return {
            transform: [
                { translateX },
                { translateY },
                { rotateZ: `${rotateZ}deg` },
            ],
        };
    }, [index]);

    return (
        <Animated.View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                maxHeight: "50%"
            }}
        >
            <Animated.View
                style={[
                    {
                        backgroundColor: "red",
                        borderRadius: 20,
                        width: WIDTH,
                        height: HEIGHT,
                        shadowColor: '#33B0D0',
                        shadowOffset: {
                            width: 0,
                            height: 8,
                        },
                        shadowOpacity: 0.44,
                        shadowRadius: 10.32,
                        elevation: 16,
                    },
                    cardStyle,
                ]}
            >
                <Image
                    source={{ uri: item.image }}
                    style={[
                        {
                            width: WIDTH,
                            height: "100%",
                            borderRadius: 20,
                        },
                    ]}
                    resizeMode={'cover'}
                />
                <Text
                    style={{
                        color: "#28648D",
                        fontWeight: "bold",
                        fontSize: 20,
                        margin: 6,
                        padding: 6,
                        textAlign: "center"
                    }}
                >
                    {item.name + `\n (${item.kind})`}
                </Text>
                <Text
                    style={{
                        color: "gray",
                        fontSize: 17,
                        fontStyle: "italic",
                        fontWeight: "500",
                        textAlign: "center",
                        marginBottom: 10,
                    }}
                >
                    {item.performer}
                </Text>
                {isVoted && isChecked &&
                    <Image
                        source={ic_check}
                        style={{
                            alignSelf: "center",
                            width: 30,
                            height: 30,
                        }} />
                }
                {!isVoted && <TouchableOpacity
                    style={{
                        alignSelf: "center",
                        borderColor: "#28648D",
                        borderWidth: 1,
                        padding: 4,
                        width: 30,
                        height: 30,
                    }}
                    onPress={() => onCheckPress(item)}
                >
                    {isChecked && <Image
                        source={ic_check}
                        style={{
                            alignSelf: "center",
                            width: 30,
                            height: 30,
                        }} />}
                </TouchableOpacity>}
            </Animated.View>
        </Animated.View >
    );
};

interface Repertoire {
    id: string;
    name: string;
    description: string;
    image: string;
    performer: string;
    kind: string;
}

interface VoteRepertoire {
    no: string;
    user_id: string;
    user_name: string;
    repertoire_id_1: string;
    repertoire_id_2: string;
}