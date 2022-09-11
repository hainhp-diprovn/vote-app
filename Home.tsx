import React from "react";
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Text, View, Image, Button } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import Carousel from "react-native-reanimated-carousel";
import { withAnchorPoint } from "./anchor-point";
import { ic_check, ic_list, ic_menu } from "./src/asset";
import Toast from 'react-native-root-toast';


const screenSize = Dimensions.get('window');
const PAGE_WIDTH = screenSize.width / 1.8;
const PAGE_HEIGHT = Math.min(screenSize.width * 1.2, screenSize.height * 0.5);

const colors = ['#fda282', '#fdba4e', '#800015'];

export default function HomeScreen() {

    const [routes, setRoutes] = useState<Repertoire[]>([]);
    const [listSelected, setListSelected] = useState<Repertoire[]>([]);
    const [votedList, setVotedList] = useState<VoteRepertoire[]>([]);
    const [showToast, setShowToast] = useState<boolean>(false);

    const isVoted = votedList.length != 0;

    useEffect(() => {
        if (!showToast) return
        const timer = setTimeout(() => {
            setShowToast(false)
        }, 1500);
        return () => clearTimeout(timer);
    }, [showToast])

    useEffect(() => {
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
                setRoutes(list)

                const scoreReponseJS = await fetch("https://sheets.googleapis.com/v4/spreadsheets/15PVp4b-CzYKin168fLgUXoUxG88FufMhDFVRCjrcIuo/values/score?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=AIzaSyCJMBXoGgagLBy8OZR4NnhGBs8R2T7e_tw")
                    .then((response) => response.json());
                const scores = scoreReponseJS.values.map((e: any) => {
                    const object = e.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
                        return { ...previousValue, [scoreReponseJS.values[0][currentIndex]]: currentValue }
                    }, {})
                    return object
                })

                const listscores = scores as VoteRepertoire[]
                const voted = listscores.filter((e) => e.user_id == "10")
                setVotedList(voted)
            } catch (exception) {
                console.error(exception);
            }
        }

        fetchData()
    }, [])

    return <View
        style={{
            flex: 1,
            alignItems: "center",
            backgroundColor: "white"
        }}>
        <Carousel
            loop
            width={PAGE_WIDTH}
            data={routes}
            scrollAnimationDuration={1000}
            style={{
                width: screenSize.width,
                justifyContent: 'center',
                alignItems: 'center',
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

        <Text
            style={{
                fontSize: 24,
                position: "absolute",
                bottom: 20,
                left: 20,
                right: 20,
                backgroundColor: isVoted ? "gray" : "#33B0D0",
                textAlign: "center",
                padding: 10,
                color: "white",
                borderRadius: 10,
                fontWeight: "bold",
            }}
        >
            Submit my choice
        </Text>
        {showToast &&
            <Toast
                visible={true}
                shadow={false}
                animation={false}
                hideOnPress={true}
            >
                You can only vote for 2 performance!!
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
                paddingTop: 30,
            }}
        >
            <Animated.View
                style={[
                    {
                        backgroundColor: "white",
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
                        color: "black",
                        fontWeight: "bold",
                        fontSize: 20,
                        margin: 6,
                        padding: 6,
                        textAlign: "center"
                    }}
                >
                    {item.name}
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
}

interface VoteRepertoire {
    no: string;
    user_id: string;
    user_name: string;
    repertoire_id_1: string;
    repertoire_id_2: string;
}