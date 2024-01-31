import { useSize } from 'ahooks';
import { Typography } from 'antd';
import React from 'react';

import { useArexCoreConfig } from '../hooks';
import { Theme } from '../theme';

const ArexLogo = () => {
  const { theme } = useArexCoreConfig();
  const size = useSize(document.getElementById('arex-menu'));

  return (
    <a
      className={'logo'}
      target='_blank'
      href={'http://arextest.com'}
      rel='noreferrer'
      style={{ width: (size?.width || 72) - 14 }}
    >
      <svg
        version='1.1'
        width='64'
        height='32'
        viewBox='300 300 600 360'
        xmlSpace='preserve'
        style={{ height: '18px' }}
      >
        <g transform='matrix(1 0 0 1 640 512)' id='background-logo'></g>
        <g
          transform='matrix(1.9211538461538462 0 0 1.9211538461538462 640.3397158039827 512.1992999383365)'
          id='logo-logo'
        >
          <g paintOrder='stroke'>
            <g transform='matrix(0.5604144880576359 0 0 0.5604144880576359 -5.684342e-14 0)'>
              <g paintOrder='stroke'>
                <g transform='matrix(1 0 0 1 0 0)'>
                  <polygon
                    style={{
                      stroke: 'none',
                      strokeWidth: 1,
                      strokeDasharray: 'none',
                      strokeLinecap: 'butt',
                      strokeDashoffset: 0,
                      strokeLinejoin: 'miter',
                      strokeMiterlimit: 4,
                      fill: theme === Theme.dark ? '#ffffffd9' : '#000000c0',
                      // fill: theme === Theme.dark ? '#ffffff68' : '#000000a2',

                      fillRule: 'nonzero',
                      opacity: 1,
                    }}
                    paintOrder='stroke'
                    points='256.79624175000004,-21.13623044999997 200.74503325,-118.22003174999998 196.94498445,-124.80999754999999 174.27500154999996,-124.80999754999999 174.11502835,-124.84997554999995 174.10501865000003,-124.80999754999999 172.77256015,-124.80999754999999 134.77042385000004,-60.344055149999974 109.77280425000004,-17.644470249999983 89.38968654999996,-29.72027584999995 94.60953525000002,-9.29302974999996 104.48508455000001,29.32501215000002 105.26438144999997,32.360107450000044 117.45481104999999,29.24261475000003 130.07456205000005,26.012390150000044 167.34476474999997,16.485412550000035 146.75937654999996,4.2882079500000145 187.06620024999995,-64.56182865 224.34152985000003,0.004028349999998682 179.21500394999998,78.16998285 174.61502835,86.14001465000001 73.94498444999999,86.14001465000001 22.935035749999997,0.010009750000051554 23.00199125000006,-0.10308834999995042 0.4969863500000429,-38.00402835 0.46500394999998207,-37.950012249999986 -51.89498135000002,-126.35998534999999 -196.94496915000002,-126.35998534999999 -202.83498385000001,-116.15002444999999 -215.03499605000002,-95.03002934999995 -269.53501125,-0.6199951499999656 -269.17502594999996,-4.999998282074e-8 -269.53501125,0.6300048500000344 -213.68502044999997,97.35998534999999 -200.84499354999997,119.59997555000007 -196.94496915000002,126.35998534999999 -172.33010105,126.35998534999999 -147.84261325,84.81994625000004 -107.94643405,16.67138675000001 -87.56337735,28.747192350000034 -92.78322605,8.319946250000044 -102.65871425,-30.29809574999996 -103.43801115000002,-33.33319094999996 -115.62844085,-30.215698250000003 -128.24819185,-26.98547364999996 -165.51845555,-17.458496149999974 -144.93300625,-5.261291549999953 -186.53139495,65.79492185000004 -224.51497654999997,-4.999998282074e-8 -181.34499354999997,-74.77001954999997 -180.69521335000002,-77.14794924999995 -174.61501314999998,-87.67999264999997 -73.94496915000002,-87.67999264999997 -28.550682049999978,-11.035095249999983 13.443641650000018,59.68798824999999 13.36484525000003,59.73480225000003 51.90500644999997,124.82000734999997 196.94498445,124.82000734999997 198.76499175000004,121.66998285 269.00498195,0.010009750000051554 269.53501125,-0.9199829499999623 '
                  />
                </g>
                <g transform='matrix(1 0 0 1 0.23300930000004882 0.7550048500000344)'>
                  <path
                    style={{
                      stroke: 'none',
                      strokeWidth: 1,
                      strokeDasharray: 'none',
                      strokeLinecap: 'butt',
                      strokeDashoffset: 0,
                      strokeLinejoin: 'miter',
                      strokeMiterlimit: 4,
                      fill: theme === Theme.dark ? '#ffffff68' : '#000000a2',
                      fillRule: 'nonzero',
                      opacity: 1,
                    }}
                    paintOrder='stroke'
                    transform=' translate(-519.06994625, -464.2640991)'
                    d='M 526.2906494 413.7172852 L 570.7419433 338.6591187 L 677.7037963 338.6591187 L 654.8786620000001 377.3790894 L 592.7819213 377.3790894 L 548.8075561 451.6381836 L 526.2906494 413.7172852 z M 489.8496704 475.2424316 L 444.8919678 551.1591185999999 L 383.255249 551.1591185999999 L 360.4360962 589.8690795 L 466.94195560000003 589.8690795 L 512.3683472 513.1664428 L 489.8496704 475.2424316 z'
                    strokeLinecap='round'
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
      <Typography.Text
        strong
        style={{ lineHeight: '14px', paddingLeft: '2px', transform: 'scale(0.7)' }}
      >
        AREX
      </Typography.Text>
    </a>
  );
};

export default ArexLogo;
