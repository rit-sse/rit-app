import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
const SVGComponent = (props: { color: string; style: any }) => (
  <Svg viewBox="0 0 24 24" fill="none" style={props.style}>
    <Circle
      cx={11}
      cy={11}
      r={7}
      stroke={props.color}
      strokeWidth={2}
    />
    <Path
      d="M20 20L16.5 16.5"
      stroke={props.color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
export default SVGComponent;
