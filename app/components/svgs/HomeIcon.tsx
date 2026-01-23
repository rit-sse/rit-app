import * as React from "react";
import Svg, { G, Defs, Path } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: title, desc */
const SVGComponent = (props: any) => (
  <Svg
    viewBox="-2 0 21 21"
    
    fill="#fff"
    {...props}
  >
    <G id="SVGRepo_bgCarrier" strokeWidth={0} />
    <G
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <G id="SVGRepo_iconCarrier">
      <Defs />
      <G
        id="Page-1"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
      >
        <G
          id="Dribbble-Light-Preview"
          transform="translate(-381.000000, -720.000000)"
          fill="#ffffff"
        >
          <G id="icons" transform="translate(56.000000, 160.000000)">
            <Path
              d="M339.875,578.013 L336.6875,578.013 L336.6875,574.013 L330.3125,574.013 L330.3125,578.013 L327.125,578.013 L327.125,568.799 L333.489375,562.809 L339.875,568.819 L339.875,578.013 Z M341.94475,568.013 L333.47025,560 L325,567.999 L325,580.013 L332.4375,580.013 L332.4375,576.013 L334.5625,576.013 L334.5625,580.013 L342,580.013 L342,579.983 L342,568.013 L341.94475,568.013 Z"
              id="home-[#1392]"
            />
          </G>
        </G>
      </G>
    </G>
  </Svg>
);
export default SVGComponent;
