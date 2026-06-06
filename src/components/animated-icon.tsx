// import { Image } from 'expo-image';
// import { useState } from 'react';
// import { Dimensions, StyleSheet, View } from 'react-native';
// import Animated, { Easing, Keyframe } from 'react-native-reanimated';
// import { scheduleOnRN } from 'react-native-worklets';

// const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
// const DURATION = 600;

// export function AnimatedSplashOverlay() {
//   const [visible, setVisible] = useState(true);

//   if (!visible) return null;

//   const splashKeyframe = new Keyframe({
//     0: {
//       transform: [{ scale: INITIAL_SCALE_FACTOR }],
//       opacity: 1,
//     },
//     20: {
//       opacity: 1,
//     },
//     70: {
//       opacity: 0,
//       easing: Easing.elastic(0.7),
//     },
//     100: {
//       opacity: 0,
//       transform: [{ scale: 1 }],
//       easing: Easing.elastic(0.7),
//     },
//   });

//   return (
//     <Animated.View
//       entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
//         'worklet';
//         if (finished) {
//           scheduleOnRN(setVisible, false);
//         }
//       })}
//       style={styles.backgroundSolidColor}
//     />
//   );
// }

// const keyframe = new Keyframe({
//   0: {
//     transform: [{ scale: INITIAL_SCALE_FACTOR }],
//   },
//   100: {
//     transform: [{ scale: 1 }],
//     easing: Easing.elastic(0.7),
//   },
// });

// const logoKeyframe = new Keyframe({
//   0: {
//     transform: [{ scale: 1.3 }],
//     opacity: 0,
//   },
//   40: {
//     transform: [{ scale: 1.3 }],
//     opacity: 0,
//     easing: Easing.elastic(0.7),
//   },
//   100: {
//     opacity: 1,
//     transform: [{ scale: 1 }],
//     easing: Easing.elastic(0.7),
//   },
// });

// const glowKeyframe = new Keyframe({
//   0: {
//     transform: [{ rotateZ: '0deg' }],
//   },
//   100: {
//     transform: [{ rotateZ: '7200deg' }],
//   },
// });

// export function AnimatedIcon() {
//   return (
//     <View style={styles.iconContainer}>
//       <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
//         <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
//       </Animated.View>

//       <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
//       <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
//         <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   imageContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   glow: {
//     width: 201,
//     height: 201,
//     position: 'absolute',
//   },
//   iconContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 128,
//     height: 128,
//     zIndex: 100,
//   },
//   image: {
//     position: 'absolute',
//     width: 76,
//     height: 71,
//   },
//   background: {
//     borderRadius: 40,
//     experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
//     width: 128,
//     height: 128,
//     position: 'absolute',
//   },
//   backgroundSolidColor: {
//     ...StyleSheet.absoluteFill,
//     backgroundColor: '#208AEF',
//     zIndex: 1000,
//   },
// });



/**
 * CookuBuddy – Splash Screen
 * Warm, editorial food aesthetic: cream + terracotta + saffron
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashOverlay() {
  const router = useRouter();

  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pop-in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Tagline fade
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      // Loading dots pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      {/* Dot grid texture overlay */}
      <View style={styles.dotGridOverlay} pointerEvents="none" />

      {/* Logo lockup */}
      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        {/* Logo Image */}
        <View style={styles.logoCircle}>
          <Image 
            source={require('../../assets/images/app-logo/icon4.png')} 
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        <Text style={styles.brandName}>CookuBuddy</Text>
        <View style={styles.accentUnderline} />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Every dish has a story. Let's cook yours.
      </Animated.Text>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingRow, { opacity: tagOpacity }]}>
        {[0, 1, 2].map(i => (
          <Animated.View
            key={i}
            style={[
              styles.loadingDot,
              {
                opacity: dotAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, i === 1 ? 1 : 0.6],
                }),
                transform: [
                  {
                    scale: dotAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, i === 1 ? 1.3 : 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Bottom wordmark */}
      <Text style={styles.bottomText}>From Anthropic's kitchen 🌿</Text>
    </View>
  );
}

const CREAM    = '#FDF6ED';
const TERRA    = '#C1440E';
const SAFFRON  = '#E8A020';
const SAGE     = '#6B7C5C';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative blobs
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTopRight: {
    width: 280,
    height: 280,
    top: -80,
    right: -80,
    backgroundColor: SAFFRON + '22',
  },
  blobBottomLeft: {
    width: 220,
    height: 220,
    bottom: -60,
    left: -60,
    backgroundColor: TERRA + '18',
  },

  dotGridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Logo area
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: TERRA,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: TERRA,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontFamily: 'Georgia',
    fontSize: 38,
    fontWeight: '700',
    color: '#2C1A0E',
    letterSpacing: 1,
  },
  accentUnderline: {
    marginTop: 8,
    width: 64,
    height: 3,
    borderRadius: 2,
    backgroundColor: TERRA,
  },

  tagline: {
    fontFamily: 'Georgia',
    fontSize: 15,
    color: SAGE,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 40,
    fontStyle: 'italic',
  },

  // Loading dots
  loadingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 60,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TERRA,
  },

  bottomText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: SAGE,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
});