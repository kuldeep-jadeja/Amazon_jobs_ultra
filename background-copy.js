// export { }
// console.log("background is up and running")

// let authToken = null
// let cookieHeader = null
// let stopPolling = false
// let candidateId = "5dbbc6d0-81e0-11f0-86a2-312569b7498d"

// // Optimize: Pre-construct headers for reuse
// const baseHeaders = {
//   "accept": "application/json, text/plain, /",
//   "accept-language": "en-US,en;q=0.9",
//   "bb-ui-version": "bb-ui-v2",
//   "cache-control": "no-cache",
//   "content-type": "application/json;charset=UTF-8",
//   "pragma": "no-cache",
//   "priority": "u=1, i",
//   "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
//   "sec-ch-ua-mobile": "?1",
//   "sec-ch-ua-platform": '"Android"',
//   "sec-fetch-dest": "empty",
//   "sec-fetch-mode": "cors",
//   "sec-fetch-site": "same-origin",
//   "Referrer-Policy": "strict-origin-when-cross-origin"
// }

// const amazonAPIHeaders = {
//   "accept": "/",
//   "accept-language": "en-US,en;q=0.9",
//   "authorization": "Bearer Status|unauthenticated|Session|eyJhbGciOiJLTVMiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NTYxOTE1NTcsImV4cCI6MTc1NjE5NTE1N30.AQICAHidzPmCkg52ERUUfDIMwcDZBDzd+C71CJf6w0t6dq2uqwGWPZ2kC9X8Ar46pq4nikNxAAAAtDCBsQYJKoZIhvcNAQcGoIGjMIGgAgEAMIGaBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDJlPUUf6mKhrRckXIgIBEIBtqcRMru3XNh1JLN/47r//ccriWP3MbGSyyWdnwhaJlo2TlhHNJqkI7HUvVuOA8QWUB+9EKj8ZT/vzhx6os/t6oYAvxz+0XImh5PhKtJ8IA4AXCYfdkBjX1Pnt6in8B8XDQkRCn9WT520YToOKrQ==",
//   "cache-control": "no-cache",
//   "content-type": "application/json",
//   "country": "Canada",
//   "iscanary": "false",
//   "pragma": "no-cache",
//   "priority": "u=1, i",
//   "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
//   "sec-ch-ua-mobile": "?1",
//   "sec-ch-ua-platform": '"Android"',
//   "sec-fetch-dest": "empty",
//   "sec-fetch-mode": "cors",
//   "sec-fetch-site": "cross-site",
//   "Referer": "https://hiring.amazon.ca/",
//   "Referrer-Policy": "strict-origin-when-cross-origin"
// }

// // Optimize: Extract common search request parameters
// const commonSearchParams = {
//   "locale": "en-CA",
//   "country": "Canada",
//   "keyWords": "",
//   "equalFilters": [],
//   "containFilters": [{ "key": "isPrivateSchedule", "val": ["false"] }],
//   "rangeFilters": [],
//   "orFilters": [],
//   "dateFilters": [{ "key": "firstDayOnSite", "range": { "startDate": "2025-02-08" } }],
//   "sorters": [{ "fieldName": "totalPayRateMax", "ascending": "false" }]
// }

// // Optimize: More efficient token capture
// chrome.webRequest.onBeforeSendHeaders.addListener(
//   function (details) {
//     for (let header of details.requestHeaders) {
//       const headerName = header.name.toLowerCase();
//       if (headerName === "authorization" && header.value.startsWith("AQICAH")) {
//         authToken = header.value;
//       } else if (headerName === "cookie" && header.value.includes("adobe-session-id")) {
//         cookieHeader = header.value;
//       }

//       // Optimize: Early exit if we have both tokens
//       if (authToken && cookieHeader) break;
//     }
//   },
//   { urls: ["<all_urls>"] },
//   ["requestHeaders", "extraHeaders"]
// )

// // Optimize: Fetch implementation with timeout
// async function fetchWithTimeout(url, options, timeout = 5000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeout);

//   const response = await fetch(url, {
//     ...options,
//     signal: controller.signal
//   });

//   clearTimeout(id);
//   return response;
// }

// async function searchAmazonJobs() {
//   const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
//   const body = JSON.stringify({
//     "operationName": "searchJobCardsByLocation",
//     "variables": {
//       "searchJobRequest": {
//         ...commonSearchParams,
//         "pageSize": 100
//       }
//     },
//     "query": "query searchJobCardsByLocation($searchJobRequest: SearchJobRequest!) {\n  searchJobCardsByLocation(searchJobRequest: $searchJobRequest) {\n    nextToken\n    jobCards {\n      jobId\n      jobTitle\n      jobType\n      employmentType\n      city\n      state\n      totalPayRateMin\n      totalPayRateMax\n      locationName\n      currencyCode\n    }\n  }\n}"
//   });

//   try {
//     const response = await fetchWithTimeout(url, {
//       method: "POST",
//       headers: amazonAPIHeaders,
//       body: body
//     }, 3000);

//     const data = await response.json();
//     return data?.data?.searchJobCardsByLocation?.jobCards || [];
//   } catch (error) {
//     console.error("Error fetching Amazon jobs:", error);
//     return [];
//   }
// }

// // Optimize: Faster schedule search with promise.all pattern
// async function searchSchedulesForJobs(jobs) {
//   if (!jobs || jobs.length === 0) return [];

//   // Create a map of jobs for fast lookups
//   const jobMap = new Map();
//   jobs.forEach(job => jobMap.set(job.jobId, job));

//   // Process all job IDs in parallel
//   const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
//   const schedulePromises = jobs.map(job => {
//     const body = JSON.stringify({
//       operationName: "searchScheduleCards",
//       variables: {
//         searchScheduleRequest: {
//           ...commonSearchParams,
//           pageSize: 1000,
//           jobId: job.jobId
//         }
//       },
//       query: `query searchScheduleCards($searchScheduleRequest: SearchScheduleRequest!) {
//           searchScheduleCards(searchScheduleRequest: $searchScheduleRequest) {
//               nextToken
//               scheduleCards {
//                   hireStartDate
//                   address
//                   basePay
//                   bonusSchedule
//                   city
//                   currencyCode
//                   distance
//                   employmentType
//                   firstDayOnSite
//                   jobId
//                   scheduleId
//                   scheduleText
//                   state
//                   totalPayRate
//                   requiredLanguage
//                   monthlyBasePay
//               }
//           }
//       }`
//     });

//     return fetchWithTimeout(url, {
//       method: "POST",
//       headers: amazonAPIHeaders,
//       body: body
//     }, 3000)
//       .then(response => response.json())
//       .then(data => {
//         const schedules = data?.data?.searchScheduleCards?.scheduleCards || [];
//         return schedules.map(schedule => ({
//           jobId: job.jobId,
//           scheduleId: schedule.scheduleId
//         }));
//       })
//       .catch(error => {
//         console.error(`Error fetching schedules for job ${job.jobId}:, error`);
//         return [];
//       });
//   });

//   const allSchedulesArrays = await Promise.all(schedulePromises);
//   // Flatten the array of arrays into a single array
//   return allSchedulesArrays.flat();
// }

// async function getLatestCookies() {
//   return new Promise((resolve) => {
//     chrome.cookies.getAll(
//       {
//         domain: "hiring.amazon.ca"
//       },
//       (cookies) => {
//         if (!cookies) {
//           console.error("No cookies found")
//           resolve(null)
//           return
//         }
//         // Construct cookie string from all relevant cookies
//         const cookieString = cookies
//           .map((cookie) => `${cookie.name}=${cookie.value}`)
//           .join("; ")
//         resolve(cookieString)
//       }
//     )
//   })
// }

// chrome.cookies.onChanged.addListener((changeInfo) => {
//   if (changeInfo.cookie.domain.includes("hiring.amazon.ca")) {
//     console.log("Cookie changed:", changeInfo.cookie.name)
//     // Update cookieHeader when relevant cookies change
//     getLatestCookies().then((cookies) => {
//       cookieHeader = cookies
//       console.log("Updated cookieHeader:", cookieHeader)
//     })
//   }
// })

// // Optimize: Consolidated application flow that completes one job at a time
// async function processApplication(jobSchedule) {
//   const { jobId, scheduleId } = jobSchedule;

//   // Prepare auth headers for application requests
//   const headers = {
//     ...baseHeaders,
//     authorization: authToken,
//     cookie: cookieHeader
//   };

//   try {

//     // Step 1: Fetch schedule details
//     const scheduleDetail = await fetchWithTimeout(
//       `https://hiring.amazon.ca/application/api/job/get-schedule-details/${scheduleId}?locale=en-US`,
//       {
//         method: "GET",
//         headers,
//         body: null
//       },
//       2000
//     );
//     const scheduleData = await scheduleDetail.json();
//     const scheduleDetails = scheduleData.data;
//     // Step 2: Create application - the critical 2nd step
//     const createResponse = await fetchWithTimeout(
//       "https://hiring.amazon.ca/application/api/candidate-application/ds/create-application/",
//       {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           jobId,
//           dspEnabled: true,
//           scheduleId,
//           candidateId,
//           activeApplicationCheckEnabled: true
//         })
//       }, 2000
//     );

//     const createData = await createResponse.json();
//     const applicationId = createData?.data?.applicationId;

//     if (createData?.errorCode) {
//       console.log(
//         `Failed to create application for ${jobId}/${scheduleId}:`,
//         createData
//       );
//       return null;
//     }

//     console.log(`Created application ID: ${applicationId}`);

//     // Step 2: Aggressively update the application (critical race condition point)
//     const updateResponse = await fetchWithTimeout(
//       "https://hiring.amazon.ca/application/api/candidate-application/update-application",
//       {
//         method: "PUT",
//         headers,
//         body: JSON.stringify({
//           applicationId,
//           payload: {
//             jobId,
//             scheduleId,
//             scheduleDetails: JSON.stringify(scheduleDetails)
//           },
//           type: "job-confirm",
//           isCsRequest: true,
//           dspEnabled: true
//         })
//       }, 2000
//     );

//     const updateRes = await updateResponse.json();
//     const urlEncodedToken = encodeURIComponent(authToken);
//     const wsUrl = `wss://ufatez9oyf.execute-api.us-east-1.amazonaws.com/prod?applicationId=${applicationId}&candidateId=${candidateId}&authToken=${urlEncodedToken}`;
//     const socket = new WebSocket(wsUrl);

//     socket.onopen = () => {
//       console.log("WebSocket connection established for application:", applicationId);
//       // Send startWorkflow
//       const startWorkflowMessage = {
//         action: "startWorkflow",
//         applicationId: applicationId,
//         candidateId: candidateId,
//         jobId: jobId, // From your jobSchedule
//         scheduleId: scheduleId, // From your jobSchedule
//         partitionAttributes: { countryCodes: ["CA"] },
//         filteringSeasonal: false,
//         filteringRegular: false
//       };
//       console.log("Sending startWorkflow:", startWorkflowMessage);
//       socket.send(JSON.stringify(startWorkflowMessage));
//     };

//     socket.onmessage = (event) => {
//       console.log("WebSocket message received at:", new Date().toLocaleTimeString());
//       try {
//         const messageData = JSON.parse(event.data);
//         console.log("Parsed message:", messageData);

//         if (messageData.stepName === "job-opportunities") {
//           // Send completeTask
//           const completeTaskMessage = {
//             action: "completeTask",
//             applicationId: applicationId,
//             candidateId: candidateId,
//             requisitionId: "",
//             jobId: jobId,
//             state: "MN", // Adjust as needed
//             employmentType: "Regular",
//             eventSource: "HVH-CA-UI",
//             jobSelectedOn: new Date().toISOString(),
//             currentWorkflowStep: "job-opportunities",
//             workflowStepName: "",
//             partitionAttributes: { countryCodes: ["CA"] },
//             filteringSeasonal: false,
//             filteringRegular: false
//           };
//           console.log("Sending completeTask:", completeTaskMessage);
//           socket.send(JSON.stringify(completeTaskMessage));
//         } else if (messageData.stepName === "general-questions") {
//           console.log("Workflow progressed to general-questions!");
//         } else if (messageData.message === "Internal server error") {
//           console.error("Server error:", messageData);
//         }
//       } catch (e) {
//         console.error("Failed to parse message:", event.data, "Error:", e);
//       }
//     };

//     socket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     socket.onclose = (event) => {
//       console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason);
//     };
//     // Step 3: In parallel, update workflow step
//     // const workflowPromise = fetchWithTimeout(
//     //   "https://hiring.amazon.ca/application/api/candidate-application/update-workflow-step-name",
//     //   {
//     //     method: "PUT",
//     //     headers,
//     //     body: JSON.stringify({
//     //       applicationId,
//     //       workflowStepName: "general-questions"
//     //     })
//     //   }, 2000
//     // );

//     // const getamazonapplication = fetchWithTimeout(
//     //   https://hiring.amazon.ca/application/api/candidate-application/applications/${applicationId},
//     //   {
//     //     method: "GET",
//     //     headers,
//     //     body: null
//     //   }, 2000
//     // );

//     // const candidate = fetchWithTimeout(
//     //   https://hiring.amazon.ca/application/api/candidate-application/candidate,
//     //   {
//     //     method: "GET",
//     //     headers,
//     //     body: null
//     //   }, 2000
//     // )

//     // // Execute both requests in parallel to save time
//     // const [updateResult, workflowResult, amazonapplication, getcandidate] = await Promise.all([
//     //   updatePromise.then(r => r.json()).catch(e => ({ error: e })),
//     //   workflowPromise.then(r => r.json()).catch(e => ({ error: e })),
//     //   getamazonapplication.then(r => r.json()).catch(e => ({ error: e })),
//     //   candidate.then(r => r.json()).catch(e => ({ error: e }))
//     // ]);

//     // console.log(Application ${applicationId} update results:, {
//     //   update: updateResult,
//     //   workflow: workflowResult,
//     //   amazonapplication: amazonapplication,
//     //   getcandidate: getcandidate
//     // });

//     return {
//       applicationId,
//       // success: !updateRes.error
//     };
//   } catch (error) {
//     console.error(`Error processing application for ${jobId}/${scheduleId}:, error`);
//     return null;
//   }
// }

// // Main optimized polling function
// async function pollForJobs() {
//   if (stopPolling) return;

//   try {
//     console.log("Starting job search cycle...");

//     // Step 1: Get all jobs
//     const jobs = await searchAmazonJobs();

//     if (jobs.length === 0) {
//       console.log("No jobs found, continuing to next poll cycle");
//       setTimeout(pollForJobs, 1); // Even more aggressive polling
//       return;
//     }

//     console.log(`Found ${jobs.length} jobs! Processing...`);

//     // Step 2: Get all schedules in parallel
//     const schedules = await searchSchedulesForJobs(jobs);

//     if (schedules.length === 0) {
//       console.log("No schedules found for any jobs");
//       setTimeout(pollForJobs, 1); // Even more aggressive polling
//       return;
//     }

//     console.log(`Found ${schedules.length} schedules across all jobs!`);

//     // Step 3: Process applications very aggressively
//     // Process in small batches for speed but not too many to overwhelm the system
//     const batchSize = 3;
//     let successfulApplication = null;

//     for (let i = 0; i < schedules.length; i += batchSize) {
//       const batch = schedules.slice(i, i + batchSize);

//       // Process batch in parallel but with a small delay between batches
//       const results = await Promise.all(
//         batch.map(schedule => processApplication(schedule))
//       );

//       // Check if any application was successful
//       const successful = results.find(r => r && r.success);
//       if (successful) {
//         console.log(`Successfully secured job application: ${successful.applicationId}`);
//         successfulApplication = successful;
//         break; // Stop processing once we have a success
//       }

//       // If we're still going and have more to process, continue immediately
//       if (i + batchSize < schedules.length && !successfulApplication && !stopPolling) {
//         continue;
//       }
//     }

//     // If we weren't successful, poll again quickly
//     if (!successfulApplication && !stopPolling) {
//       console.log("No successful applications this cycle, polling again");
//       setTimeout(pollForJobs, 10); // Even more aggressive polling
//     }
//   } catch (error) {
//     console.error("Error during polling cycle:", error);
//     if (!stopPolling) {
//       setTimeout(pollForJobs, 50); // Still aggressive, but a bit longer after error
//     }
//   }
// }

// // Stop polling
// function stopJobSearch() {
//   stopPolling = true;
//   console.log("Job search stopped by user");
// }

// // Message listener
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "stopJobSearch") {
//     stopJobSearch();
//     sendResponse({ status: "stopped" });
//   }
//   if (message.action === "startJobSearch") {
//     stopPolling = false;
//     pollForJobs();
//     sendResponse({ status: "started" });
//   }
//   return true; // Important for async response
// });



export { }

console.log("background is up and running (enhanced)")

let authToken = null
let cookieHeader = null
let stopPolling = false
let candidateId = "5dbbc6d0-81e0-11f0-86a2-312569b7498d"

// === Headers ===
const baseHeaders = {
  "accept": "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "bb-ui-version": "bb-ui-v2",
  "cache-control": "no-cache",
  "content-type": "application/json;charset=UTF-8",
  "pragma": "no-cache",
  "priority": "u=1, i",
  "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

const amazonAPIHeaders = {
  ...baseHeaders,
  "accept": "*/*",
  "country": "Canada",
  "iscanary": "false",
  "Referer": "https://hiring.amazon.ca/",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

// === Search params ===
const commonSearchParams = {
  "locale": "en-CA",
  "country": "Canada",
  "keyWords": "",
  "equalFilters": [],
  "containFilters": [{ "key": "isPrivateSchedule", "val": ["false"] }],
  "rangeFilters": [],
  "orFilters": [],
  "dateFilters": [{ "key": "firstDayOnSite", "range": { "startDate": "2025-08-27" } }],
  "sorters": [{ "fieldName": "totalPayRateMax", "ascending": "false" }]
}

// === Capture tokens/cookies quickly ===
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    // Only capture from Amazon-related requests
    if (details.url && (details.url.includes('amazon') || details.url.includes('amazonaws'))) {
      for (let header of details.requestHeaders) {
        const headerName = header.name.toLowerCase();

        // Capture any authorization header from Amazon domains
        if (!authToken && headerName === "authorization" && header.value) {
          // Accept various token formats (Bearer tokens, AWS tokens, etc.)
          if (header.value.startsWith("Bearer ") ||
            header.value.startsWith("AQICAH") ||
            header.value.includes("aws") ||
            header.value.length > 100) { // Long tokens are likely valid
            authToken = header.value;
            console.log("Captured authToken:", header.value.substring(0, 50) + "...");
          }
        }

        // Capture cookies from Amazon hiring domain
        else if (!cookieHeader && headerName === "cookie" && header.value &&
          (header.value.includes("adobe-session-id") || header.value.includes("session"))) {
          cookieHeader = header.value;
          console.log("Captured cookieHeader (partial)");
        }

        if (authToken && cookieHeader) break;
      }
    }
  },
  { urls: ["*://*.amazon.ca/*", "*://*.amazonaws.com/*", "*://hiring.amazon.ca/*"] },
  ["requestHeaders", "extraHeaders"]
)

// === Helper function to check authentication status ===
function checkAuthStatus() {
  console.log("=== AUTH STATUS ===");
  console.log("AuthToken:", authToken ? "PRESENT (" + authToken.substring(0, 30) + "...)" : "MISSING");
  console.log("CookieHeader:", cookieHeader ? "PRESENT" : "MISSING");
  console.log("==================");

  if (!authToken || !cookieHeader) {
    console.warn("⚠️  Missing authentication - please visit https://hiring.amazon.ca and browse some jobs to capture tokens");
    return false;
  }
  return true;
}

// === Helper: fetch with timeout & retries ===
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Small retry utility (returns last error if fails)
async function retry(fn, attempts = 3, delayMs = 300) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// === Jobs search ===
async function searchAmazonJobs() {
  const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
  const body = JSON.stringify({
    "operationName": "searchJobCardsByLocation",
    "variables": {
      "searchJobRequest": {
        ...commonSearchParams,
        "pageSize": 100
      }
    },
    "query": "query searchJobCardsByLocation($searchJobRequest: SearchJobRequest!) {\n  searchJobCardsByLocation(searchJobRequest: $searchJobRequest) {\n    nextToken\n    jobCards {\n      jobId\n      jobTitle\n      jobType\n      employmentType\n      city\n      state\n      totalPayRateMin\n      totalPayRateMax\n      locationName\n      currencyCode\n    }\n  }\n}"
  });

  try {
    console.log("Searching for jobs with params:", JSON.stringify(commonSearchParams, null, 2));
    console.log("Using authToken:", authToken ? (authToken.substring(0, 50) + "...") : "NONE");
    console.log("Using cookies:", cookieHeader ? "YES" : "NONE");

    const headers = {
      ...amazonAPIHeaders,
      cookie: cookieHeader || ""
    };

    // Only add authorization if we have a token
    if (authToken) {
      headers.authorization = authToken;
    }

    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers,
      body
    }, 3000);

    const data = await res.json();
    console.log("API Response status:", res.status);
    if (data?.errors) {
      console.error("API returned errors:", data.errors);

      // If unauthorized, try to refresh tokens
      if (data.errors.some(e => e.errorType === "UnauthorizedException")) {
        console.log("401 Unauthorized - need to visit Amazon hiring site to refresh tokens");
        authToken = null;  // Reset token to force re-capture
        cookieHeader = null; // Reset cookies to force re-capture
      }
    }
    const jobs = data?.data?.searchJobCardsByLocation?.jobCards || [];
    console.log(`API returned ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error("Error fetching Amazon jobs:", error);
    return [];
  }
}

// === Schedule search (parallel) ===
async function searchSchedulesForJobs(jobs) {
  if (!jobs || jobs.length === 0) return [];

  const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";

  const schedulePromises = jobs.map(job => {
    const body = JSON.stringify({
      operationName: "searchScheduleCards",
      variables: {
        searchScheduleRequest: {
          ...commonSearchParams,
          pageSize: 1000,
          jobId: job.jobId
        }
      },
      query: `query searchScheduleCards($searchScheduleRequest: SearchScheduleRequest!) {
          searchScheduleCards(searchScheduleRequest: $searchScheduleRequest) {
              nextToken
              scheduleCards {
                  hireStartDate
                  address
                  basePay
                  bonusSchedule
                  city
                  currencyCode
                  distance
                  employmentType
                  firstDayOnSite
                  jobId
                  scheduleId
                  scheduleText
                  state
                  totalPayRate
                  requiredLanguage
                  monthlyBasePay
              }
          }
      }`
    });

    return fetchWithTimeout(url, {
      method: "POST",
      headers: {
        ...amazonAPIHeaders,
        authorization: authToken || "",
        cookie: cookieHeader || ""
      },
      body
    }, 3000)
      .then(r => r.json())
      .then(data => {
        const schedules = data?.data?.searchScheduleCards?.scheduleCards || [];
        return schedules.map(schedule => ({
          jobId: job.jobId,
          scheduleId: schedule.scheduleId,
          scheduleDetails: schedule
        }));
      })
      .catch(error => {
        console.error(`Error fetching schedules for job ${job.jobId}:`, error);
        return [];
      });
  });

  const all = await Promise.all(schedulePromises);
  return all.flat();
}

// === Cookies helper ===
async function getLatestCookies() {
  return new Promise((resolve) => {
    chrome.cookies.getAll(
      {
        domain: "hiring.amazon.ca"
      },
      (cookies) => {
        if (!cookies || cookies.length === 0) {
          console.warn("No cookies found via chrome.cookies.getAll");
          resolve(null)
          return
        }
        const cookieString = cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; ")
        resolve(cookieString)
      }
    )
  })
}

chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie && changeInfo.cookie.domain && changeInfo.cookie.domain.includes("hiring.amazon.ca")) {
    console.log("Cookie changed:", changeInfo.cookie.name)
    getLatestCookies().then((cookies) => {
      cookieHeader = cookies
      console.log("Updated cookieHeader:", cookieHeader ? "[REDACTED]" : null)
    })
  }
})

// === Concurrency control for processing applications ===
const MAX_CONCURRENT_APPLICATIONS = 3
let activeApplications = 0
const applicationQueue = []

function enqueueApplicationTask(task) {
  applicationQueue.push(task)
  processQueue()
}

function processQueue() {
  while (activeApplications < MAX_CONCURRENT_APPLICATIONS && applicationQueue.length > 0 && !stopPolling) {
    const task = applicationQueue.shift()
    activeApplications++
    task().finally(() => {
      activeApplications--
      processQueue()
    })
  }
}

// === Process one application and try to schedule an interview ===
async function processApplication(jobSchedule) {
  const { jobId, scheduleId, scheduleDetails } = jobSchedule;

  // Wait for tokens/cookies if missing (short wait only)
  if (!authToken || !cookieHeader) {
    console.log("Waiting briefly for authToken/cookies to be available...");
    try {
      await retry(async () => {
        if (!authToken) throw new Error("no authToken")
        if (!cookieHeader) throw new Error("no cookies")
      }, 4, 250)
    } catch (e) {
      console.warn("auth/cookie unavailable; attempting to fetch cookies (best-effort)");
      cookieHeader = cookieHeader || await getLatestCookies();
      if (!authToken || !cookieHeader) {
        console.error("Missing authToken or cookieHeader; skipping application", jobId, scheduleId);
        return null;
      }
    }
  }

  const headers = {
    ...baseHeaders,
    authorization: authToken,
    cookie: cookieHeader
  };

  try {
    // 1) Fetch schedule details (defensive)
    let scheduleData = null;
    try {
      const scheduleDetail = await fetchWithTimeout(
        `https://hiring.amazon.ca/application/api/job/get-schedule-details/${scheduleId}?locale=en-US`,
        { method: "GET", headers, body: null },
        2000
      );
      scheduleData = await scheduleDetail.json();
    } catch (e) {
      console.warn("Failed to fetch schedule details, proceeding with existing scheduleDetails", e);
      scheduleData = { data: scheduleDetails };
    }

    // 2) Create application (retry small number of times)
    const createResponse = await retry(async () => {
      const res = await fetchWithTimeout(
        "https://hiring.amazon.ca/application/api/candidate-application/ds/create-application/",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            jobId,
            dspEnabled: true,
            scheduleId,
            candidateId,
            activeApplicationCheckEnabled: true
          })
        }, 2500
      );
      const json = await res.json();
      if (json?.errorCode) throw new Error("create application returned errorCode");
      return json;
    }, 3, 300);

    const applicationId = createResponse?.data?.applicationId;
    if (!applicationId) {
      console.error("No applicationId returned for create-application", jobId, scheduleId, createResponse);
      return null;
    }
    console.log(`Created application ${applicationId} for ${jobId}/${scheduleId}`);

    // 3) Update application quickly
    let updateRes = null;
    try {
      const updateResponse = await fetchWithTimeout(
        "https://hiring.amazon.ca/application/api/candidate-application/update-application",
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            applicationId,
            payload: {
              jobId,
              scheduleId,
              scheduleDetails: JSON.stringify(scheduleData?.data || scheduleDetails)
            },
            type: "job-confirm",
            isCsRequest: true,
            dspEnabled: true
          })
        }, 2000
      );

      updateRes = await updateResponse.json();
    } catch (e) {
      console.warn("update-application failed (continuing):", e);
    }

    // 4) Open WebSocket and drive workflow — also attempt to schedule interview when server moves workflow to interview scheduling step
    const urlEncodedToken = encodeURIComponent(authToken);
    const wsUrl = `wss://ufatez9oyf.execute-api.us-east-1.amazonaws.com/prod?applicationId=${applicationId}&candidateId=${candidateId}&authToken=${urlEncodedToken}`;
    const socket = new WebSocket(wsUrl);

    let wsClosed = false;

    socket.onopen = () => {
      console.log("WebSocket open for application:", applicationId);
      const startWorkflowMessage = {
        action: "startWorkflow",
        applicationId,
        candidateId,
        jobId,
        scheduleId,
        partitionAttributes: { countryCodes: ["CA"] },
        filteringSeasonal: false,
        filteringRegular: false
      };
      socket.send(JSON.stringify(startWorkflowMessage));
      // Immediately send the job-opportunities completeTask as you did before
      const completeTaskMessage = {
        action: "completeTask",
        applicationId,
        candidateId,
        requisitionId: "",
        jobId,
        state: "MN",
        employmentType: "Regular",
        eventSource: "HVH-CA-UI",
        jobSelectedOn: new Date().toISOString(),
        currentWorkflowStep: "job-opportunities",
        workflowStepName: "",
        partitionAttributes: { countryCodes: ["CA"] },
        filteringSeasonal: false,
        filteringRegular: false
      };
      // small delay to avoid hammering immediately
      setTimeout(() => {
        try {
          socket.send(JSON.stringify(completeTaskMessage));
          console.log("Sent initial completeTask for job-opportunities (optimistic).");
        } catch (e) {
          console.warn("Failed to send initial completeTask:", e);
        }
      }, 150);
    };

    // helper to send interview scheduling message (adjust payload to your needs)
    function attemptScheduleInterviewMessage(applicationId, candidateId, jobId, scheduleId, preferredSlots = []) {
      // You may need to modify message shape if your backend expects different keys.
      const msg = {
        action: "scheduleInterview",
        applicationId,
        candidateId,
        jobId,
        scheduleId,
        preferredSlots, // e.g. [{start: "...", end: "..."}]
        timezone: "America/Toronto", // adjust if needed
        // additional attributes can be added here
      };
      return msg;
    }

    // react to server workflow steps
    socket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log("WS message:", messageData?.stepName || messageData?.message || messageData);

        // when server indicates interview scheduling step, attempt to schedule via socket
        if (messageData.stepName === "interview-scheduling" || messageData.stepName === "schedule-interview" || messageData.stepName === "interview-schedule") {
          console.log("Workflow reached interview scheduling step for", applicationId);
          // Build preferred slots from scheduleDetails if available (best-effort)
          let preferredSlots = [];
          try {
            const sd = scheduleData?.data || scheduleDetails || {};
            // If schedule contains hireStartDate or firstDayOnSite, propose that as a slot.
            if (sd.firstDayOnSite || sd.hireStartDate) {
              preferredSlots.push({
                start: sd.firstDayOnSite || sd.hireStartDate,
                end: sd.firstDayOnSite || sd.hireStartDate
              });
            }
          } catch (e) {
            // ignore
          }

          const interviewMsg = attemptScheduleInterviewMessage(applicationId, candidateId, jobId, scheduleId, preferredSlots);
          try {
            socket.send(JSON.stringify(interviewMsg));
            console.log("Sent scheduleInterview message:", interviewMsg);
          } catch (e) {
            console.error("Failed to send scheduleInterview message:", e);
          }
        }

        // If server expects a 'completeTask' for interview scheduling to move forward, do that too
        if (messageData.stepName === "interview-scheduling-complete" || messageData.stepName === "interview-complete") {
          console.log("Completing interview scheduling step (fallback) for", applicationId);
          const completeInterviewTask = {
            action: "completeTask",
            applicationId,
            candidateId,
            jobId,
            scheduleId,
            currentWorkflowStep: "interview-scheduling",
            workflowStepName: "interview-scheduling",
            jobSelectedOn: new Date().toISOString()
          };
          try {
            socket.send(JSON.stringify(completeInterviewTask));
            console.log("Sent interview completeTask.");
          } catch (e) {
            console.warn("Failed to send interview completeTask:", e);
          }
        }

        // Logging for server errors
        if (messageData.message && messageData.message.toLowerCase().includes("internal server error")) {
          console.error("Server error message from WS:", messageData);
        }
      } catch (e) {
        console.error("Failed to parse WS message:", e, "raw:", event.data);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error for app", applicationId, err);
    };

    socket.onclose = (ev) => {
      wsClosed = true;
      console.log("WebSocket closed for application", applicationId, "code:", ev?.code, "reason:", ev?.reason);
    };

    // safety: close socket after some time to avoid leaking connections
    setTimeout(() => {
      try {
        if (!wsClosed && socket && socket.readyState === WebSocket.OPEN) {
          socket.close(1000, "auto-close after timeout");
          console.log("Auto-closing websocket for", applicationId);
        }
      } catch (e) { }
    }, 30_000); // keep open up to 30s — adjust as needed

    return { applicationId, jobId, scheduleId };
  } catch (error) {
    console.error(`Error processing application for ${jobSchedule.jobId}/${jobSchedule.scheduleId}:`, error);
    return null;
  }
}

// === Main poller (preserve same aggressive frequency behavior) ===
async function pollForJobs() {
  if (stopPolling) return;

  try {
    console.log("Starting job search cycle...");

    // Check authentication status
    if (!checkAuthStatus()) {
      console.log("Waiting for authentication tokens...");
      setTimeout(pollForJobs, 10000); // Wait 10 seconds when missing auth
      return;
    }

    // Step 1: Get all jobs immediately
    const jobs = await searchAmazonJobs();

    if (!jobs || jobs.length === 0) {
      console.log("No jobs found, continuing to next poll cycle");
      // preserve your aggressive intervals (you used setTimeout with 1 earlier)
      setTimeout(pollForJobs, 1);
      return;
    }

    console.log(`Found ${jobs.length} jobs — grabbing schedules and trying to apply ASAP.`);

    // Step 2: Get all schedules for the jobs
    const schedules = await searchSchedulesForJobs(jobs);

    if (!schedules || schedules.length === 0) {
      console.log("No schedules found for any jobs — continuing polling");
      setTimeout(pollForJobs, 1);
      return;
    }

    console.log(`Found ${schedules.length} schedules. Enqueuing application attempts (concurrency ${MAX_CONCURRENT_APPLICATIONS})`);

    // Enqueue tasks — we'll process in controlled concurrency
    for (const schedule of schedules) {
      enqueueApplicationTask(async () => {
        const res = await processApplication(schedule);
        if (res && res.applicationId) {
          console.log("Application flow started for", res.applicationId);
        }
        // return for queue bookkeeping
        return res;
      });
    }

    // After queuing everything: if nothing successful we re-poll quickly (keep aggressiveness)
    // We don't block here; queue runs tasks in background.
    setTimeout(() => {
      if (!stopPolling) {
        // quick re-poll — same aggressive pattern as before
        pollForJobs();
      }
    }, 10);

  } catch (error) {
    console.error("Error during polling cycle:", error);
    if (!stopPolling) {
      setTimeout(pollForJobs, 50);
    }
  }
}

// Stop polling
function stopJobSearch() {
  stopPolling = true;
  console.log("Job search stopped by user");
}

// Message listener (start/stop)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "stopJobSearch") {
    stopJobSearch();
    sendResponse({ status: "stopped" });
  }
  if (message.action === "startJobSearch") {
    stopPolling = false;
    // If we haven't captured cookies yet, try to get them proactively
    getLatestCookies().then(c => { if (c) cookieHeader = c });

    // Check auth status before starting
    if (!authToken || !cookieHeader) {
      console.warn("🚨 AUTHENTICATION REQUIRED 🚨");
      console.warn("Please visit https://hiring.amazon.ca in the same browser");
      console.warn("Browse some jobs or log in to capture the required tokens");
      console.warn("Then restart the job search");
    }

    pollForJobs();
    sendResponse({ status: "started" });
  }
  if (message.action === "checkAuth") {
    const hasAuth = checkAuthStatus();
    sendResponse({
      status: hasAuth ? "authenticated" : "missing",
      authToken: !!authToken,
      cookies: !!cookieHeader
    });
  }
  return true; // Important for async response
});
