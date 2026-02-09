class ModelAvailabilityDTO():

    # Name of the model
    model_name: str

    # Whether the model has been downloaded in the app data directory
    downloaded: bool = False

    # Whether there is enough local disk space for the model to be used
    supported: bool = False

    # Whether the model can be used right now given RAM space
    usable_now: bool = False

    # If the model can't be used, why 
    reason: str = ""

    def __init__(self, model_name):
        self.model_name = model_name