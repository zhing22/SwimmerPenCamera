import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {Dimensions} from 'react-native';
// @ts-ignore
// import Video from 'react-native-video-processing';
import Orientation from 'react-native-orientation';

const CameraScreen = ({}) => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  React.useEffect(() => {
    requestPermission();
  }, []);

  const format = useCameraFormat(device, [
    {fps: 60},
    {videoResolution: {width: 3048, height: 2160}},
  ]);

  const camera = useRef<Camera>(null);

  const [recording, setRecording] = useState(false);
  const [videoPath, setVideoPath] = useState('');

  if (device == null)
    return (
      <View style={styles.container1}>
        <Text style={styles.title}>Welcome to the Camera Screen!</Text>
      </View>
    );

  async function startRecording() {
    if (camera.current) {
      try {
        console.log('>> isLandscapeRight:', isLandscapeRight);
        // start recording
        camera.current.startRecording({
          onRecordingError: error => console.error(error),
          videoBitRate: 'high',
          // when recording end,
          onRecordingFinished: async video => {
            const path = video.path;
            console.log(path);
            // Rotate the video 90 degrees anti-clockwise
            // const rotatedVideoPath = await Video.rotate(path, '90', {
            //   save: {
            //     compressFormat: 'mp4',
            //     quality: '1.0',
            //   },
            // });
            // setVideoPath(rotatedVideoPath);

            try {
              // Save the recorded video to the camera roll
              await CameraRoll.save(`file://${path}`, {
                type: 'video',
              });
              console.log('>>Video saved to camera roll');
            } catch (error) {
              console.error('>>Error saving video to camera roll:', error);
            }
          },
        });
      } catch (error) {
        console.error('>>Error recording video', error);
      }
    }
  }

  function stopRecording() {
    try {
      setRecording(false);
      if (camera.current) {
        camera.current.stopRecording();
      }
    } catch (error) {
      console.error('>>Error stopping video', error);
    }
  }

  async function takePhoto() {
    if (camera.current) {
      try {
        const file = await camera.current.takePhoto();
        console.log('photo', file);
        await CameraRoll.save(`file://${file.path}`, {
          type: 'photo',
        });
      } catch (error) {
        console.error('>>Error taking picture', error);
      }
    }
  }

  const [isLandscapeRight, setIsLandscapeRight] = useState(false);

  useEffect(() => {
    const onOrientationChange = (orientation: any) => {
      if (orientation === 'LANDSCAPE-LEFT') {
        setIsLandscapeRight(false);
      } else if (orientation === 'LANDSCAPE-RIGHT') {
        setIsLandscapeRight(true);
      }
    };

    Orientation.addOrientationListener(onOrientationChange);
    return () => {
      Orientation.removeOrientationListener(onOrientationChange);
    };
  }, []);

  // Lock the orientation to landscape (optional)
  useEffect(() => {
    Orientation.lockToLandscape();
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  const window = Dimensions.get('window');
  const layout = {
    width: window.width, // You can adjust this based on your requirements
    height: window.height, // You can adjust this based on your requirements
  };

  return (
    <View style={styles.container}>
      {/* <OrientationLocker
        orientation={LANDSCAPE}
        onChange={orientation => console.log('onChange', orientation)}
        onDeviceChange={orientation => console.log('onDeviceChange', orientation)}
      /> */}
      <View
        style={{
          transform: [
            isLandscapeRight ? {rotate: '-90deg'} : {rotate: '90deg'},
          ],
          width: layout.height,
          height: layout.width,
          position: 'absolute',
          left: layout.width / 2 - layout.height / 2,
          top: layout.height / 2 - layout.width / 2,
        }}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={true}
          video={true}
          photo={true}
        />
      </View>

      {/* buttons */}
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.text}>Photo</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.button} onPress={startRecording}>
          <Text style={styles.text}>Start Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopRecording}>
          <Text style={styles.text}>Stop Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  container1: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20,
    paddingBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginVertical: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  fullScreenContainer: {
    flex: 1,
    marginVertical: 50,
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },
  exitText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
