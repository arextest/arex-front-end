import { urlPretreatment } from '../../components/arex-request/helpers/utils/util';
import axios from '../../helpers/api/axios';
import { runCompareRESTRequest } from '../../helpers/CompareRequestRunner';
import { FileSystemService } from '../../services/FileSystem.service';

export const getBatchCompareResults = async (
  caseIds: string[],
  envs: { key: string; value: string }[],
): Promise<
  {
    caseRequest: {
      method: string;
      endpoint: string;
      compareMethod: string;
      compareEndpoint: string;
    };
    compareResult: {
      responses: [any, any];
    };
    quickCompare: any;
  }[]
> => {
  const results = [];
  for (let i = 0; i < caseIds.length; i++) {
    try {
      const caseId = caseIds[i];
      const caseRequest = await FileSystemService.queryCase({ id: caseId });
      const {
        endpoint,
        method,
        compareEndpoint,
        compareMethod,
        testScripts,
        headers,
        params,
        body,
      } = caseRequest;

      const compareResult = await runCompareRESTRequest({
        endpoint: urlPretreatment(endpoint, envs),
        auth: null,
        name: '',
        preRequestScripts: [],
        compareEndpoint: urlPretreatment(compareEndpoint, envs),
        compareMethod: compareMethod,
        method: method,
        testScripts: testScripts,
        params: params,
        headers: headers,
        body: body,
      });
      const quickCompare = await axios
        .post('/report/compare/quickCompare', {
          msgCombination: {
            baseMsg: JSON.stringify(compareResult.responses[0]),
            testMsg: JSON.stringify(compareResult.responses[1]),
          },
        })
        .then((res) => {
          const rows = res.body.diffDetails || [];
          return rows.map((r) => r.logs[0]);
        });

      results.push({
        caseRequest,
        compareResult,
        quickCompare,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return results;
};

function isJson(obj) {
  return (
    typeof obj == 'object' &&
    Object.prototype.toString.call(obj).toLowerCase() === '[object object]' &&
    !obj.length
  );
}
export function checkResponsesIsJson(responses) {
  return isJson(responses[0]) && isJson(responses[1]);
}
