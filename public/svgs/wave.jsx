import { Col } from "antd";
import Link from "antd/es/typography/Link";

const WaveIcon = ({className, pos, onClick, icon}) => {
  return (
    <div  className={`waveCont ${pos}`} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" className={`wave ${pos}`} viewBox="0 0 566 373" fill="none">
        <path d="M0 0.999996C73.6667 -1 213 6.49998 338 135C421 218 473 306.5 568 372.5H0V0.999996Z" fill="#242424"></path>
      </svg>
      
      <Col className={className}>
        {icon}
      </Col>
    </div>
  );
};

export default WaveIcon;