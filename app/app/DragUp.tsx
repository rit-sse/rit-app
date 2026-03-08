import {Modal, Pressable, StyleSheet, View} from "react-native";
import React, {ReactNode} from "react";

type DragUpProps = {
  visible?: boolean;
  setVisible?: (visible: boolean) => void;
  children?: ReactNode;
  bottomOffset?: number;
  heightPercent?: number;
};

export default function DragUp({
  visible = false,
  setVisible = () => {},
  children = null,
  bottomOffset = 0,
  heightPercent = 50,
}: Readonly<DragUpProps>) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
      <View style={[styles.modalView, {bottom: bottomOffset, height: `${heightPercent}%`}]}>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  modalView: {
    margin: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    position: "absolute",
    width: "100%",
  },
});
