import * as React from "react";
import Svg, { Circle, Line } from "react-native-svg";

const SVGComponent = (props: { color?: string; style?: any }) => (
  <Svg viewBox="0 0 24 24" fill="none" style={props.style}>
    <Line x1={4} y1={7} x2={20} y2={7} stroke={props.color || "#000000"} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={15} cy={7} r={2.5} stroke={props.color || "#000000"} strokeWidth={2} fill="#ffffff" />
    <Line x1={4} y1={17} x2={20} y2={17} stroke={props.color || "#000000"} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={9} cy={17} r={2.5} stroke={props.color || "#000000"} strokeWidth={2} fill="#ffffff" />
  </Svg>
);
export default SVGComponent;
