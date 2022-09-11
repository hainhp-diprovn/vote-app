import React from "react";
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Text, View, Image, Button } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import Carousel from "react-native-reanimated-carousel";
import { withAnchorPoint } from "./anchor-point";
import { ic_list, ic_menu } from "./src/asset";

const screenSize = Dimensions.get('window');
const PAGE_WIDTH = screenSize.width / 1.8;
const PAGE_HEIGHT = Math.min(screenSize.width * 1.2, screenSize.height * 0.5);

const colors = ['#fda282', '#fdba4e', '#800015'];

export default function HomeScreen() {

    const [routes, setRoutes] = useState<Repertoire[]>([]);
    const [indexSelected, setIndexSelected] = useState<number>(0);
    const [isListMode, setIsListMode] = useState<boolean>(false);

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
                console.log(list)
                setRoutes(list)


                const scoreReponseJS = await fetch("https://sheets.googleapis.com/v4/spreadsheets/15PVp4b-CzYKin168fLgUXoUxG88FufMhDFVRCjrcIuo/values/score?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=AIzaSyCJMBXoGgagLBy8OZR4NnhGBs8R2T7e_tw")
                    .then((response) => response.json());
                const scores = scoreReponseJS.values.map((e: any) => {
                    const object = e.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
                        return { ...previousValue, [scoreReponseJS.values[0][currentIndex]]: currentValue }
                    }, {})
                    return object
                })
                console.log(scores)

                const listscores = scores as VoteRepertoire[]
                const isVoted = listscores.filter((e) => e.user_id == "10").length != 0
                console.log("isVoted", isVoted)
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
                height: PAGE_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20
            }}
            onSnapToItem={(index) => console.log('current index:', index)}
            renderItem={({ item, index, animationValue }) => (
                <Card
                    item={item}
                    animationValue={animationValue}
                    key={index}
                    index={index}
                />
            )}
        />
        <Text
            style={{
                fontSize: 30,
                marginHorizontal: 10,
                marginTop: -40
            }}
        >
            {routes[indexSelected]?.name ?? ""}
        </Text>
        <Text
            style={{
                fontSize: 15,
                marginTop: 10,
                marginHorizontal: 10,
                color: "gray"
            }}
        >
            {routes[indexSelected]?.description ?? ""}
        </Text>
        <Text
            style={{
                fontSize: 20,
                position: "absolute",
                bottom: 20,
                left: 20,
                right: 20,
                backgroundColor: "red",
                textAlign: "center",
                padding: 10,
                color: "white",
                borderRadius: 10,
            }}
        >
            Vote for title
        </Text>
    </View>
}

const Card: React.FC<{
    item: Repertoire,
    index: number;
    animationValue: Animated.SharedValue<number>;
}> = ({ item, index, animationValue }) => {
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
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Animated.View
                style={[
                    {
                        backgroundColor: colors[index],
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 20,
                        width: WIDTH,
                        height: HEIGHT,
                        shadowColor: '#000',
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
                            width: WIDTH * 0.86,
                            height: "90%",
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            zIndex: 999,
                        },
                    ]}
                    resizeMode={'cover'}
                />

            </Animated.View>
        </Animated.View>
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