import React, {useCallback, useEffect} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import {useFilePicker} from "use-file-picker";
import "./FileSelectionInput.scss"
import Spinner from "../../Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";
import {FileContent} from "use-file-picker/types";
import {FileWithPath} from "file-selector";
import {ConfigType} from "dayjs";
import {useDropzone} from "react-dropzone";

const FileSelectionInput = ({
    accept = '*',
    multiple = true,
    readAs = 'Text',
    readFilesContent = true,
    onSelectedChange
}: {
    accept?: string;
    multiple?: boolean;
    readAs?: 'Text' | 'BinaryString' | 'ArrayBuffer' | 'DataURL';
    readFilesContent?: boolean;
    onSelectedChange: (selected: FileContent<ConfigType>[]) => void;
}) => {
    const { openFilePicker, filesContent, loading } = useFilePicker({
        accept: accept,
        multiple: multiple,
        readFilesContent: readFilesContent,
    });

    const [loadingFromDrop, setLoadingFromDrop] = React.useState(false);

    const parseFile = useCallback(
        (file: FileWithPath) =>
            new Promise<FileContent<ConfigType>>(
                async (
                    resolve: (fileContent: FileContent<ConfigType>) => void,
                    reject: (reason: {}) => void
                ) => {
                    const reader = new FileReader();

                    //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
                    const readStrategy = reader[`readAs${readAs}`] as typeof reader.readAsText;
                    readStrategy.call(reader, file);

                    const addError = ({ ...others }) => {
                        reject({ ...others });
                    };

                    reader.onload = async () =>
                        resolve({
                            ...file,
                            content: reader.result as string,
                            name: file.name,
                            lastModified: file.lastModified,
                        });

                    reader.onerror = () => {
                        addError({ name: 'FileReaderError', readerError: reader.error, causedByFile: file });
                    };
                }
            ),
        [accept, multiple, readAs, readFilesContent]
    );

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter((file) => file.type === accept);

        setLoadingFromDrop(true);

        validFiles.length > 0 && Promise.all(validFiles.map(parseFile)).then((files) => {
            onSelectedChange(files);
            setLoadingFromDrop(false);
        })
    }, [])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    useEffect(() => {
        onSelectedChange(filesContent);
    }, [filesContent]);

    return (
        <InputBaseComponent
            title={""}
            onClick={() => openFilePicker()}
        >
            <div {...getRootProps()} className="file-selection-input">
                { loading || loadingFromDrop ? <Spinner type={SpinnerType.DOTS} /> : <span className="file-selection-input-selection-text">Drop or click to select file</span> }
            </div>
        </InputBaseComponent>
    );
};

export default FileSelectionInput;