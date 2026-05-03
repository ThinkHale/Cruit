import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;
const SWIPE_VELOCITY = 800;

interface SwipeCardProps {
  onSwipe: (direction: 'left' | 'right') => void;
  children: React.ReactNode;
  stackIndex: number;
}

export function SwipeCard({ onSwipe, children, stackIndex }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isTop = stackIndex === 0;

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate(e => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(e => {
      const shouldSwipeRight = e.translationX > SWIPE_THRESHOLD || e.velocityX > SWIPE_VELOCITY;
      const shouldSwipeLeft = e.translationX < -SWIPE_THRESHOLD || e.velocityX < -SWIPE_VELOCITY;

      if (shouldSwipeRight) {
        translateX.value = withSpring(SCREEN_W * 1.5, { velocity: e.velocityX }, finished => {
          if (finished) runOnJS(onSwipe)('right');
        });
      } else if (shouldSwipeLeft) {
        translateX.value = withSpring(-SCREEN_W * 1.5, { velocity: e.velocityX }, finished => {
          if (finished) runOnJS(onSwipe)('left');
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const scale = 1 - stackIndex * 0.04;
  const offsetY = stackIndex * 10;

  const animatedStyle = useAnimatedStyle(() => {
    if (!isTop) {
      return { transform: [{ translateY: offsetY }, { scale }] };
    }
    const rotation = interpolate(translateX.value, [-200, 200], [-15, 15], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30 - stackIndex },
          animatedStyle,
        ]}
      >
        {isTop && (
          <>
            <Animated.View style={[likeOverlay, { borderColor: '#4ade80', left: 16, top: 24 }, likeStyle]}>
              <Animated.Text style={{ color: '#4ade80', fontWeight: '900', fontSize: 18 }}>LIKE</Animated.Text>
            </Animated.View>
            <Animated.View style={[likeOverlay, { borderColor: '#f87171', right: 16, top: 24 }, nopeStyle]}>
              <Animated.Text style={{ color: '#f87171', fontWeight: '900', fontSize: 18 }}>NOPE</Animated.Text>
            </Animated.View>
          </>
        )}
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const likeOverlay = {
  position: 'absolute' as const,
  borderWidth: 3,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
  zIndex: 10,
  transform: [{ rotate: '-18deg' }],
};
