import * as React from "react";
import Svg, { Mask, Rect, G, Path } from "react-native-svg";
const SVGComponent = (props: {onPress?: () => void, style?: any}) => (
  <Svg
    viewBox="0 0 36 36"
    fill="none"
    role="img"
    onPress={props.onPress}
    style={props.style}
  >
    <Mask
      id="_r_44_"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={36}
      height={36}
    >
      <Rect width={36} height={36} rx={72} fill="#FFFFFF" />
    </Mask>
    <G mask="url(#_r_44_)">
      <Rect width={36} height={36} fill="#361d20" />
      <Rect
        x={0}
        y={0}
        width={36}
        height={36}
        transform="translate(-5 9) rotate(149 18 18) scale(1.2)"
        fill="#f7cd67"
        rx={36}
      />
      <G transform="translate(-5 4.5) rotate(9 18 18)">
        <Path d="M13,21 a1,0.75 0 0,0 10,0" fill="#000000" />
        <Rect
          x={10}
          y={14}
          width={1.5}
          height={2}
          rx={1}
          stroke="none"
          fill="#000000"
        />
        <Rect
          x={24}
          y={14}
          width={1.5}
          height={2}
          rx={1}
          stroke="none"
          fill="#000000"
        />
      </G>
    </G>
  </Svg>
);
export default SVGComponent;
