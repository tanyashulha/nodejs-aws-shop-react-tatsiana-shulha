import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import axios from "axios";
import {
  assertOkResponse,
  getAuthorizedRequestConfig,
  getAxiosErrorMessage,
} from "~/setupAxios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setErrorMessage(undefined);
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setErrorMessage(undefined);
  };

  const uploadFile = async () => {
    if (!file) return;

    setErrorMessage(undefined);

    try {
      const res = await axios.get(url, {
        ...getAuthorizedRequestConfig(),
        params: { name: file.name },
      });

      const signedUrl = assertOkResponse(res);

      const result = await fetch(signedUrl, {
        method: "PUT",
        body: file,
      });

      if (!result.ok) {
        setErrorMessage(`Error ${result.status}: S3 upload failed`);
        return;
      }

      setFile(undefined);
    } catch (error) {
      setErrorMessage(getAxiosErrorMessage(error));
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setErrorMessage(undefined)}
        >
          {errorMessage}
        </Alert>
      )}
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
