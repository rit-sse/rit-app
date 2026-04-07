import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
const SVGComponent = (props: {color: string, style: any}) => (
  <Svg
    viewBox="0 0 24 24"
    fill="none"
    style={props.style}
  >
    <G id="SVGRepo_bgCarrier" strokeWidth={0} />
    <G
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <G id="SVGRepo_iconCarrier">
      <Path
        d="M15 6L9 12L15 18"
        stroke={props.color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
export default SVGComponent;