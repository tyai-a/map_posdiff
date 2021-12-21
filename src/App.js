import React from 'react';
import { Box } from '@chakra-ui/react';
import { Wrap, WrapItem } from '@chakra-ui/react';
import { Grid, GridItem } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import './styles.css';
import 'leaflet/dist/leaflet.css';

const R = Math.PI / 180;
const data = [
  {
    name: '位置情報1',
    lat: 35.666863,
    lng: 139.84954,
  },
  {
    name: '位置情報2',
    lat: 35.663729,
    lng: 139.744047,
  },
  {
    name: '位置情報3',
    lat: 43.064313,
    lng: 141.347255,
  },
  {
    name: '位置情報4',
    lat: 35.663729,
    lng: 139.744047,
  },
];

/* 2点間の距離を計算し、kmで返却 */
const distance = (lat1, lng1, lat2, lng2) => {
  lat1 *= R;
  lng1 *= R;
  lat2 *= R;
  lng2 *= R;
  return (
    6371 *
    Math.acos(
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) +
        Math.sin(lat1) * Math.sin(lat2)
    )
  );
};

/* 引数の配列を全て比較し、小数点を切り捨てして返却する */
const checkArrayDistance = array => {
  const processedArray = array.map((x, i) => {
    //　現在ループ中のインデックスを取得、一致する値を削除して新たな配列を作成
    const getArrayNotNowLoopIndex = array
      .map((_x, _i) => {
        if (i === _i) return undefined;
        return _x;
      })
      .filter(e => typeof e !== 'undefined');

    //　距離を比較して新たな配列を作成
    const loopArrayDistance = getArrayNotNowLoopIndex.map((_x, _i) => {
      if (!_x) return undefined;
      return {
        diff: `${x.name} > ${_x.name}: `,
        distance: distance(x.lat, x.lng, _x.lat, _x.lng),
      };
    });

    // 距離が短い順に並び替え
    const sortDistance = loopArrayDistance.sort((a, b) => {
      return a.distance - b.distance;
    });

    //　小数第一位まで絞り込み
    const roundArrayValue = sortDistance.map((_x, _i) => {
      return {
        ..._x,
        distance: Math.round(_x.distance * 10) / 10,
      };
    });

    return roundArrayValue;
  });
  return processedArray;
};

export default function App() {
  return (
    <div className="App">
      <Grid
        h="200px"
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(5, 1fr)"
      >
        <GridItem rowSpan={1} colSpan={1} bg="tomato">
          {checkArrayDistance(data).map((x, i) => (
            <Wrap border="1px" borderColor="gray.600" mt={5} p={2} key={i}>
              {x.map((_x, _i) => (
                <WrapItem key={_i}>
                  <Box border="1px" borderColor="gray.200" p={2} key={_x.diff}>
                    {_x.diff}
                    {_x.distance}km
                  </Box>
                </WrapItem>
              ))}
            </Wrap>
          ))}
        </GridItem>
        <GridItem rowSpan={1} colSpan={4}>
          <MapContainer
            center={[34.6873377, 135.5237668]}
            zoom={12}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {data.map((d, i) => (
              <Circle center={[d.lat, d.lng]} radius={1000} key={i} position={[d.lat, d.lng]}/>
            ))}
          </MapContainer>
        </GridItem>
      </Grid>
    </div>
  );
}
