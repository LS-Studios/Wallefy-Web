import {DependencyList, useEffect, useMemo, useRef} from "react";
import uuid from "react-uuid";

//IMPORTANT: Change the path relative to the worker folder!
const workerFolderPath = "../Workers/";

export const useWebWorker = <InputType, OutputType>(workerBuilder: () => Worker, deps: DependencyList) => {
    const worker = useMemo(workerBuilder, deps);
    const taskMap = useRef<Map<string, { abort: () => void }>>(new Map());

    useEffect(() => {
        return () => {
            worker.terminate();
            taskMap.current.forEach(({ abort }) => abort());
            taskMap.current.clear();
        };
    }, [worker]);

    return useMemo(() => (data: InputType, id: string = uuid()): Promise<OutputType> => {
        if (!id) throw new Error("id is undefined");

        if (taskMap.current.has(id)) {
            taskMap.current.get(id)?.abort();
        }

        return new Promise<OutputType>((resolve, reject) => {
            const handleMessage = (e: MessageEvent) => {
                resolve(e.data as OutputType);
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
                taskMap.current.delete(id);
            };

            const handleError = (e: ErrorEvent) => {
                reject(e);
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
                taskMap.current.delete(id);
            };

            const abort = () => {
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
            };

            worker.addEventListener('message', handleMessage);
            worker.addEventListener('error', handleError);

            worker.postMessage(JSON.stringify(data));

            taskMap.current.set(id, { abort });
        });
    }, deps);
}