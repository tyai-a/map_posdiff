import { React, useEffect, useState, useReducer } from 'react';
import { Formik, Form, Field } from 'formik';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  FormControl,
  Text,
  FormErrorMessage,
  Input,
  Wrap,
  WrapItem,
  Grid,
  GridItem,
  Stack,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { MapContainer, TileLayer } from 'react-leaflet';
import './styles.css';
import 'leaflet/dist/leaflet.css';

const R = Math.PI / 180;

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
        diff: `${_x.name}との距離`,
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

const initialLocationList = [
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

const reducerLocation = (state, action) => {
  switch (action.type) {
    case 'addLocationItem':
      return [...state, action.value];
    case 'reset':
      return initialLocationList;
    default:
      return state;
  }
};

const validateLatitude = value => {
  let error;
  const isLatitude = isFinite(value) && Math.abs(value) <= 90;
  if (!value) error = '入力必須です。';
  if (!isLatitude) error = '形式が異なります。';
  return error;
};
const validateLongitude = value => {
  let error;
  const isLongitude = isFinite(value) && Math.abs(value) <= 180;
  if (!value) error = '入力必須です。';
  if (!isLongitude) error = '形式が異なります。';
  return error;
};

export default function App() {
  // const [locationList, dispatchLocaion] = useReducer(reducerLocation, initialLocationList)
  // const { locationList } = useLocationControl();
  const [locationList, locationListDispatch] = useReducer(
    reducerLocation,
    initialLocationList
  );

  return (
    <div className="App">
      <Grid
        h="100%"
        templateRows="repeat(1, 1fr)"
        templateColumns="200px 200px 1fr"
      >
        <GridItem
          rowSpan={1}
          colSpan={1}
          p={3}
          borderRight={'1px solid'}
          borderRightColor={'gray.200'}
        >
          <Formik
            initialValues={{
              name: '',
              lat: '',
              lng: '',
            }}
            onSubmit={(values, actions) => {
              locationListDispatch({ type: 'addLocationItem', value: values });
              actions.setSubmitting(false);
            }}
          >
            {props => (
              <Form>
                <Stack>
                  <Field name="name">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.name && form.touched.name}
                      >
                        <Input {...field} placeholder="場所の名前" size="sm" />
                      </FormControl>
                    )}
                  </Field>
                  <Field name="lat" validate={validateLatitude}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.lat && form.touched.lat}
                      >
                        <Input {...field} placeholder="経度" size="sm" />
                        <FormErrorMessage>
                          <Text fontSize={'xs'}>{form.errors.lat}</Text>
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="lng" validate={validateLongitude}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.lng && form.touched.lng}
                      >
                        <Input {...field} placeholder="経度" size="sm" />
                        <FormErrorMessage>
                          <Text fontSize={'xs'}>{form.errors.lng}</Text>
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Button
                    mt={4}
                    size={'sm'}
                    colorScheme="teal"
                    leftIcon={<FaPlus />}
                    isLoading={props.isSubmitting}
                    type="submit"
                  >
                    追加する
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Accordion allowToggle>
            {locationList.map((x, i) => (
              <AccordionItem key={x.name}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Box>{x.name}</Box>
                    <Box fontSize="xs">
                      {x.lat},{x.lng}
                    </Box>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {checkArrayDistance(locationList)[i].map((_x, _i) => (
                    <Wrap mt={1} key={_x.diff}>
                      <WrapItem>
                        <Box>
                          <Text fontSize={'sm'} fontWeight={'bold'}>
                            {_x.distance}km
                          </Text>
                          <Text fontSize={'xs'}>{_x.diff}</Text>
                        </Box>
                      </WrapItem>
                    </Wrap>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          {/* {checkArrayDistance(data).map((x, i) => (
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
          ))} */}
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <MapContainer
            center={[34.6873377, 135.5237668]}
            zoom={12}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* {data.map((d, i) => (
              <Circle center={[d.lat, d.lng]} radius={1000} key={i} position={[d.lat, d.lng]}/>
            ))} */}
          </MapContainer>
        </GridItem>
      </Grid>
    </div>
  );
}
