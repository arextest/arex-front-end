import { styled } from '@arextest/arex-core';
import { Carousel } from 'antd';

const TreeCarousel = styled(Carousel)`
  .slick-dots-bottom {
    position: relative;
    margin: 16px 0 0 0;
  }
  .slick-dots.slick-dots-bottom {
    li > button {
      height: 4px;
      border-radius: 2px;
      background-color: ${(props) => props.theme.colorTextTertiary}!important;
    }
    * > li.slick-active > button {
      background-color: ${(props) => props.theme.colorTextQuaternary}!important;
    }
  }
`;

export default TreeCarousel;
