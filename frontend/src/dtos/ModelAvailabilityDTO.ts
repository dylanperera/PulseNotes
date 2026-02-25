export type ModelAvailabilityDTO = {
    model_name: string,
    downloaded: boolean,
    supported: boolean,
    useable_now: boolean,
    reason: string
}