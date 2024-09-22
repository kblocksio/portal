import { useCallback } from "react";

interface OpenPopupWindowOptions {
  url: string | URL;
  width?: number;
  height?: number;
  onClose?: () => void;
}

export const usePopupWindow = () => {
  // const [popupWindow, setPopupWindow] = useState<Window>();

  const openPopupWindow = useCallback(
    ({
      url,
      width = 600,
      height = 720,
      onClose = () => {},
    }: OpenPopupWindowOptions): Window | null => {
      const left = screen.width / 2 - (width / 2 + 10);
      const top = screen.height / 2 - (height / 2 + 50);
      const newPopupWindow = window.open(
        url,
        "_blank",
        "status=no,height=" +
          height +
          ",width=" +
          width +
          ",resizable=yes,left=" +
          left +
          ",top=" +
          top +
          ",screenX=" +
          left +
          ",screenY=" +
          top +
          ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no",
      );

      // setPopupWindow(newPopupWindow as Window);

      const interval = setInterval(() => {
        if (newPopupWindow?.closed) {
          clearInterval(interval);
          onClose();
        }
      }, 1000);

      return newPopupWindow;
    },
    [],
  );

  return { openPopupWindow };
};
