from app.services.model_services import ModelServices
import unittest


class TestSummarizationSelectionMacOS(unittest.TestCase):
    def test_summarization_service(self):
        ### Arrange
        model_services = ModelServices()
        path = '/'
        ### Act
        result = (model_services.check_available_models(path))

        for i in result:
            print("name: " + i.model_name)
            print("downloaded: " + str(i.downloaded))
            print("supported: " + str(i.supported))
            print("usable now: " + str(i.usable_now))
            print("reason: " + i.reason)
            print()

    def test_model_downloadings(self):
        ### Arrange
        model_services = ModelServices()
        path = '/Users/dylanperera/Desktop/test_models'
        model_name = "Llama-3.2-1B-Instruct-Q5_K_S.gguf"
        ### Act
        result = model_services.download_model(path, model_name)
        print(result)

if __name__ == "__main__":
    unittest.main()