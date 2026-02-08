from app.services.model_selection_service import ModelSelectionService
import unittest


class TestSummarizationServiceMacOS(unittest.TestCase):
    def test_summarization_service(self):
        ### Arrange
        model_selection_service = ModelSelectionService()
        path = '/'
        ### Act
        result = (model_selection_service.check_available_models(path))

        for i in result:
            print("name: " + i.model_name)
            print("downloaded: " + str(i.downloaded))
            print("supported: " + str(i.supported))
            print("usable now: " + str(i.usable_now))
            print("reason: " + i.reason)
            print()

if __name__ == "__main__":
    unittest.main()