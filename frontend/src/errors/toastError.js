import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";
import { isString } from 'lodash';

const toastError = err => {
  const errorMsg = err.response?.data?.error;
  const customToastClass = "rounded-toast";  

  if (errorMsg) {
    if (i18n.exists(`backendErrors.${errorMsg}`)) {
      toast.error(i18n.t(`backendErrors.${errorMsg}`), {
        toastId: errorMsg,
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        className: customToastClass, 
      });
      return;
    } else {
      toast.error(errorMsg, {
        toastId: errorMsg,
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        className: customToastClass,
      });
      return;
    }
  }

  if (isString(err)) {
    toast.error(err, {
      className: customToastClass, 
    });
    return;
  } else {
    toast.error("An error occurred!", {
      className: customToastClass, 
    });
    return;
  }
};

export default toastError;
