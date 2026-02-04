import {Modal, StyleSheet, Text, Pressable, View} from 'react-native';

export default function DragUp({getVisible=()=>{return false},setVisible=(visible:boolean)=>{},children=<></>}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={getVisible()}>
      <View style={styles.modalView}>
        <Pressable
          style={[styles.button]}
          onPress={() => setVisible(false)}>
          <Text style={styles.textStyle}>Hide Modal</Text>
        </Pressable>

        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,

    position:'absolute',
    bottom:0,
    width:"100%",
    height:"50%"
  },
  button: {
    position:'absolute',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});