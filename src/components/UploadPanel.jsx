import React, { useRef } from "react";
import { Button } from "react-bootstrap";

const UploadPanel = ({ onUpload }) => {

  const ref = useRef();

  const handleFile = (file) => {

    const reader = new FileReader();

    reader.onloadend = () => onUpload(reader.result);

    reader.readAsDataURL(file);

  };

  return (

    <div className="flex items-center">

      <Button
        variant="light"
        onClick={() => ref.current.click()}
      >
        Subir foto
      </Button>

      <input
        type="file"
        ref={ref}
        className="d-none"
        onChange={(e) => handleFile(e.target.files[0])}
      />

    </div>

  );

};

export default UploadPanel;