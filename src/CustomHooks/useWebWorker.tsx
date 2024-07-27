import {DependencyList, useEffect, useMemo} from "react";

//IMPORTANT: Change the path relative to the worker folder!
const workerFolderPath = "../Workers/";

export const useWebWorker = <InputType, OutputType>(workerBuilder: () => Worker, deps: DependencyList) => {
    const worker = useMemo(workerBuilder, deps);

    useEffect(() => {
        return () => {
            worker.terminate();
        };
    }, [worker]);

    return useMemo(() => (data: InputType): Promise<OutputType> => {
        return new Promise((resolve, reject) => {
            const handleMessage = (e: MessageEvent) => {
                resolve(e.data as OutputType);
                worker.removeEventListener('message', handleMessage);
            };

            const handleError = (e: ErrorEvent) => {
                reject(e);
                worker.removeEventListener('error', handleError);
            };

            worker.addEventListener('message', handleMessage);
            worker.addEventListener('error', handleError);

            worker.postMessage(JSON.stringify(data));
        });
    }, deps)
}