import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialize Gemini SDK to prevent startup crashes if API key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== '') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// ==========================================
// API ROUTE 1: Predictive Pathing AI Engine
// ==========================================
app.post('/api/ai/predictive-pathing', async (req, res) => {
  const { venueId, activeNodes, averageFlowRate } = req.body;
  const ai = getAI();

  if (!ai) {
    // Elegant fallback simulation
    const congestedNodes = activeNodes?.filter((n: any) => n.status === 'congested') || [];
    const bottleneckText = congestedNodes.length > 0 
      ? congestedNodes.map((n: any) => n.name).join(', ') 
      : 'South Corridor A1';
    
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      forecastTime: '15 Minutes Future',
      densityIndex: 78,
      bottlenecks: [bottleneckText],
      recommendedReroute: 'Route fans through turnstiles B (VIP) and Ramp South-East to distribute the load.',
      insights: 'AI Model predicted heavy queue backup at South Entrance due to incoming public transport delays. Flow rate stabilized at 420 passes/min.'
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Perform a crowd density and bottleneck predictive pathing analysis. 
Venue: ${venueId}
Active Nodes state: ${JSON.stringify(activeNodes)}
Average Turnstile Flow Rate: ${averageFlowRate} people/min.

Provide the response in structured JSON format matching this schema:
{
  "densityIndex": number (0-100 indicating congestion),
  "bottlenecks": string[], (list of names of bottleneck nodes)
  "recommendedReroute": string, (step-by-step redirection path instructions)
  "insights": string (brief analytical overview of crowd dynamics)
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            densityIndex: { type: Type.INTEGER },
            bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedReroute: { type: Type.STRING },
            insights: { type: Type.STRING }
          },
          required: ['densityIndex', 'bottlenecks', 'recommendedReroute', 'insights']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 2: Multi-Agent In-Seat Concierge
// ==========================================
app.post('/api/ai/concierge-chat', async (req, res) => {
  const { message, userSeat, chatHistory } = req.body;
  const ai = getAI();

  if (!ai) {
    // Beautiful simulation fallback
    const msgLower = message.toLowerCase();
    const actions: any[] = [];
    let responseText = `Stadia Concierge is processing your request for seat ${userSeat}. `;

    if (msgLower.includes('ticket') || msgLower.includes('vip')) {
      actions.push({ type: 'TICKETING', description: 'Checking upgrade availability for VIP sectors.', status: 'success' });
      responseText += 'We have verified your VIP upgrade status. ';
    }
    if (msgLower.includes('burger') || msgLower.includes('order') || msgLower.includes('beer') || msgLower.includes('food')) {
      actions.push({ type: 'DIETARY_POS', description: 'Pre-ordered items routed to closest vendor kitchen.', status: 'success' });
      responseText += 'Your concession pre-order has been placed. ';
    }
    if (msgLower.includes('leak') || msgLower.includes('spark') || msgLower.includes('broken') || msgLower.includes('spill') || msgLower.includes('escalator')) {
      actions.push({ type: 'CMMS_DISPATCH', description: 'Logged safety work order. ECT/MEP squad notified.', status: 'success' });
      responseText += 'We have dispatched maintenance teams immediately to investigate. ';
    }

    if (actions.length === 0) {
      actions.push({ type: 'ASSIST', description: 'General wayfinding helper initialized.', status: 'success' });
      responseText += "How can I assist you with ticket upgrades, food pre-ordering, or facility issues today?";
    }

    return res.json({
      success: true,
      mode: 'simulation-fallback',
      reply: responseText,
      actionsPerformed: actions
    });
  }

  try {
    const formattedHistory = chatHistory?.map((c: any) => `${c.sender}: ${c.text}`).join('\n') || '';
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Stadia Multi-Agent In-Seat Concierge chatbot. The user is in seat: "${userSeat}".
User prompt: "${message}"
History:\n${formattedHistory}

Your task is to analyze the user's prompt and concurrently split commands into distinct backend execution tasks.
Check if they are requesting:
1. Concession ordering or pre-ordering of food/beverages (DIETARY_POS)
2. Ticket upgrades, queries, or transfers (TICKETING)
3. Infrastructure reporting, hazard logs, maintenance, cleaning, broken items (CMMS_DISPATCH)

Provide your response in JSON format:
{
  "reply": "Polished, helpful natural language response to user in their language.",
  "actionsPerformed": [
    {
      "type": "DIETARY_POS" | "TICKETING" | "CMMS_DISPATCH" | "INFO",
      "description": "Short explanation of backend action triggered (e.g. 'Dispatched MEP team to fix leaking toilet in Sec 102')",
      "status": "success"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            actionsPerformed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ['type', 'description', 'status']
              }
            }
          },
          required: ['reply', 'actionsPerformed']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 3: NLP Work Order Generation
// ==========================================
app.post('/api/ai/nlp-workorder', async (req, res) => {
  const { dictation, reportedBy } = req.body;
  const ai = getAI();

  if (!ai) {
    // Beautiful simulation fallback
    const text = dictation.toLowerCase();
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let assignedRole = 'Sector Volunteer Lead (SVL)';
    let assetId = 'UNKNOWN';
    let title = 'General Facility Log';

    if (text.includes('leak') || text.includes('water') || text.includes('spill') || text.includes('flood')) {
      priority = 'high';
      assignedRole = 'Environmental Cleanliness Tech (ECT)';
      title = 'Liquid Spill / Plumbing Overflow';
      assetId = 'S-PLUMB-REST';
    } else if (text.includes('spark') || text.includes('fire') || text.includes('smoke') || text.includes('power')) {
      priority = 'critical';
      assignedRole = 'Low-Voltage & AV Systems Engineer (LVA)';
      title = 'Electrical / Low-Voltage Hazard';
      assetId = 'S-SUB-GRID';
    } else if (text.includes('fight') || text.includes('altercation') || text.includes('security') || text.includes('drunk')) {
      priority = 'critical';
      assignedRole = 'Rapid Response Security Officer (RRSO)';
      title = 'Crowd Safety & Security Escalation';
      assetId = 'SECTOR-CROWD';
    }

    return res.json({
      success: true,
      mode: 'simulation-fallback',
      workOrder: {
        id: 'WO-' + Math.floor(Math.random() * 9000 + 1000),
        title,
        description: dictation,
        location: 'Sector geofenced based on broadcast range',
        assetId,
        priority,
        assignedToRole: assignedRole,
        status: 'open',
        createdAt: new Date().toISOString(),
        reportedBy: reportedBy || 'Field Staff Voice'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Translate this real-time staff voice dictation into a structured geofenced facilities work order ticket.
Staff Voice dictation: "${dictation}"
Reported By: "${reportedBy || 'Field Staff Voice'}"

Analyze the text and map to the most appropriate priority (low, medium, high, critical), title, assetId (guess logical ID like HVAC-1, RESTROOM-B, TURNSTILE-A), and appropriate role to assign out of these available options:
- 'MEP Technician (MEP)'
- 'Low-Voltage & AV Systems Engineer (LVA)'
- 'Rapid Response Security Officer (RRSO)'
- 'Environmental Cleanliness Tech (ECT)'
- 'Sector Volunteer Lead (SVL)'

Response in JSON schema:
{
  "title": string,
  "description": string,
  "location": string,
  "assetId": string,
  "priority": "low" | "medium" | "high" | "critical",
  "assignedToRole": string,
  "status": "open"
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            location: { type: Type.STRING },
            assetId: { type: Type.STRING },
            priority: { type: Type.STRING },
            assignedToRole: { type: Type.STRING },
            status: { type: Type.STRING }
          },
          required: ['title', 'description', 'location', 'assetId', 'priority', 'assignedToRole', 'status']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    // Inject custom random ID and timestamp
    parsed.id = 'WO-' + Math.floor(Math.random() * 9000 + 1000);
    parsed.createdAt = new Date().toISOString();
    parsed.reportedBy = reportedBy || 'Field Staff Voice';

    res.json({ success: true, workOrder: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 4: Offline Playbook RAG
// ==========================================
app.post('/api/ai/playbook-rag', async (req, res) => {
  const { query, playbookProtocols, language } = req.body;
  const startTime = Date.now();
  const ai = getAI();

  if (!ai) {
    // Local fast RAG simulation matching database
    const queryLower = query.toLowerCase();
    let matchingProtocol = playbookProtocols?.[0]?.protocol || 'Isolate area and notify safety lead.';
    
    // Attempt simple matches
    for (const item of playbookProtocols || []) {
      if (queryLower.includes(item.topic.toLowerCase()) || queryLower.includes(item.category.toLowerCase())) {
        matchingProtocol = item.protocol;
        break;
      }
    }

    const elapsed = Date.now() - startTime;
    return res.json({
      success: true,
      mode: 'simulation-offline-rag',
      sourceMatch: 'Local Embedded DB Cache',
      responseTimeMs: Math.min(elapsed + 10, 390), // guarantee sub-400ms for playbook
      protocolText: matchingProtocol,
      translatedProtocolText: language && language !== 'English' 
        ? `[Translated to ${language}]: ${matchingProtocol}` 
        : matchingProtocol
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an offline edge-hosted Retrieval-Augmented Generation (RAG) assistant for stadium playbooks.
Available Playbook Protocols Database: ${JSON.stringify(playbookProtocols)}
User Query: "${query}"
Target Language: "${language || 'English'}"

Find the most relevant protocol in the provided list. Translate it precisely to the target language. If no protocol matches perfectly, extrapolate based on standard stadium emergency operations, but prioritize matching the database.

Provide your response in JSON:
{
  "sourceMatch": "Title of the matched protocol / General standard",
  "protocolText": "English protocol text",
  "translatedProtocolText": "Translated protocol text in the requested target language"
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sourceMatch: { type: Type.STRING },
            protocolText: { type: Type.STRING },
            translatedProtocolText: { type: Type.STRING }
          },
          required: ['sourceMatch', 'protocolText', 'translatedProtocolText']
        }
      }
    });

    const elapsed = Date.now() - startTime;
    const parsed = JSON.parse(response.text || '{}');
    parsed.responseTimeMs = elapsed;
    parsed.success = true;

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 5: BMS Telemetry Reasoning
// ==========================================
app.post('/api/ai/bms-reasoning', async (req, res) => {
  const { sensors } = req.body;
  const ai = getAI();

  if (!ai) {
    // Simulating advanced thermal failure predictions
    const alertSensors = sensors?.filter((s: any) => s.status === 'alert') || [];
    
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      analysisStatus: 'Thermal Scan Finished',
      anomaliesFound: alertSensors.length,
      recommendations: alertSensors.map((s: any) => ({
        sensorId: s.id,
        assetName: s.name,
        estimatedFailureHours: 24,
        prescriptiveTask: `Thermal overload detected. Deploy MEP Technician to inspect Chiller fluid pressure or reset active load. Clean internal ventilation filters immediately.`
      }))
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Perform thermal and diagnostic reasoning on continuous Building Management System (BMS) IoT sensor streams.
Sensor data: ${JSON.stringify(sensors)}

Detect anomalies, estimate failure timeframe, and prescribe preventive maintenance (PM) models to resolve issues before hardware failure.

Response JSON schema:
{
  "analysisStatus": string,
  "anomaliesFound": number,
  "recommendations": [
    {
      "sensorId": string,
      "assetName": string,
      "estimatedFailureHours": number,
      "prescriptiveTask": string
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisStatus: { type: Type.STRING },
            anomaliesFound: { type: Type.INTEGER },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sensorId: { type: Type.STRING },
                  assetName: { type: Type.STRING },
                  estimatedFailureHours: { type: Type.INTEGER },
                  prescriptiveTask: { type: Type.STRING }
                },
                required: ['sensorId', 'assetName', 'estimatedFailureHours', 'prescriptiveTask']
              }
            }
          },
          required: ['analysisStatus', 'anomaliesFound', 'recommendations']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 6: Neural POS Revenue Reconciliation
// ==========================================
app.post('/api/ai/revenue-recon', async (req, res) => {
  const { revenues, currentCrowdVolume } = req.body;
  const ai = getAI();

  if (!ai) {
    // Basic heuristics for POS velocity matching
    const reconciledLogs = revenues?.map((vendor: any) => {
      let anomalyDetected = false;
      let reason = '';
      if (vendor.salesVelocity < 1.0 && currentCrowdVolume > 40000 && vendor.stockLevelPercent > 20) {
        anomalyDetected = true;
        reason = `Suspiciously low sales velocity (${vendor.salesVelocity} tx/min) during Peak Attendance. Possible POS network drop, localized power glitch, or inventory logging error. Check register system.`;
      }
      return {
        ...vendor,
        anomalyDetected,
        anomalyReason: reason
      };
    });

    return res.json({
      success: true,
      mode: 'simulation-fallback',
      crowdLevel: currentCrowdVolume,
      reconciledLogs
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Perform Neural POS revenue reconciliation auditing.
Concession Vendor Logs: ${JSON.stringify(revenues)}
Stadium Live Attendance Volume: ${currentCrowdVolume}

Compare transactional speeds/velocities against overall crowd density. Flag tenancies showing severe revenue anomalies, such as low transactions during peak attendance, or extreme drop in stock levels without corresponding gross increases.

Response JSON schema:
{
  "reconciledLogs": [
    {
      "vendorName": string,
      "anomalyDetected": boolean,
      "anomalyReason": string
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reconciledLogs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vendorName: { type: Type.STRING },
                  anomalyDetected: { type: Type.BOOLEAN },
                  anomalyReason: { type: Type.STRING }
                },
                required: ['vendorName', 'anomalyDetected', 'anomalyReason']
              }
            }
          },
          required: ['reconciledLogs']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    // Map parsed logs back to append original figures
    const mergedLogs = revenues.map((v: any) => {
      const parsedMatch = parsed.reconciledLogs?.find((p: any) => p.vendorName === v.vendorName);
      return {
        ...v,
        anomalyDetected: parsedMatch ? parsedMatch.anomalyDetected : false,
        anomalyReason: parsedMatch ? parsedMatch.anomalyReason : ''
      };
    });

    res.json({
      success: true,
      crowdLevel: currentCrowdVolume,
      reconciledLogs: mergedLogs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 7: Large World Model Event Orchestration
// ==========================================
app.post('/api/ai/lwm-orchestration', async (req, res) => {
  const { trigger, venueData } = req.body;
  const ai = getAI();

  if (!ai) {
    // Quality procedural simulation
    const draftText = `URGENT VENUE UPDATE: Due to sudden severe thunderstorm and municipal transport delays, the match kickoff has been delayed by 45 minutes to ensure safe attendee entry. Concourse shelters are open; concessions are fully staffed. Please seek shelter inside. Updates to follow.`;
    
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      scenarioName: 'Severe Contingency Mode: ' + trigger,
      riskLevel: 'high',
      impactAnalysis: `Thunderstorm will restrict outdoor movement. Budgeting 15,000 attendees stranded in Bud Light Plaza. Public transport delay is causing bottleneck at main Verizon Gate entry. Estimated queue buildup: 45 minutes.`,
      proposedNotifications: [
        'Push Notification (All Fans): Match delayed. Please move into covered concourses. Food counters are operating.',
        'SMS Alert (Municipal Transit Links): Ingress flow stalled. Request additional rail cars on Line 4.',
        'VHF Radio Dispatch (Safety Stewards): Direct queues inside. Expand turnstile bypass zones.'
      ],
      draftBroadcast: draftText,
      transitGuidelines: 'Direct central transit networks to increase transit shuttles by 35% on egress routes.'
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Stadia Large World Model (LWM) Event Orchestrator. 
Active Contingency Trigger: "${trigger}"
Venue Data Summary: ${JSON.stringify(venueData)}

Synthesize stadium telemetry to generate a real-time contingency plan for Executive Director approval. Evaluate physical impact on walkways, transport capacity, and safety egress. Draft mass push notifications for fans and operations adjustments for security.

Response JSON schema:
{
  "scenarioName": string,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "impactAnalysis": string,
  "proposedNotifications": string[],
  "draftBroadcast": string,
  "transitGuidelines": string
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioName: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            impactAnalysis: { type: Type.STRING },
            proposedNotifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            draftBroadcast: { type: Type.STRING },
            transitGuidelines: { type: Type.STRING }
          },
          required: ['scenarioName', 'riskLevel', 'impactAnalysis', 'proposedNotifications', 'draftBroadcast', 'transitGuidelines']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 8: Dynamic Yield Revenue Engine
// ==========================================
app.post('/api/ai/yield-quote', async (req, res) => {
  const { eventType, expectedAttendance, requestedDays } = req.body;
  const ai = getAI();

  if (!ai) {
    // Clean mechanical calculation fallback
    const attendanceNum = parseInt(expectedAttendance) || 20000;
    const baseRate = eventType === 'Concert' ? 120000 : 75000;
    const utilityWearCost = Math.round(attendanceNum * 1.85);
    const turfRecoveryCost = eventType === 'Concert' ? 35000 : 15000;
    const staffSurcharge = Math.round(attendanceNum * 2.25);
    const totalQuote = baseRate + utilityWearCost + turfRecoveryCost + staffSurcharge;

    return res.json({
      success: true,
      mode: 'simulation-fallback',
      quoteId: 'QT-' + Math.floor(Math.random() * 90000 + 10000),
      wearAndTearCoefficient: (attendanceNum / 100000).toFixed(2),
      estimatedUtilityDrawKWh: attendanceNum * 0.45,
      requiredSecurityStaff: Math.ceil(attendanceNum / 250),
      turfRecoveryRequired: eventType === 'Concert' ? 'Full pitch replacement block required' : 'Standard aeration and vacuuming',
      pricingBreakdown: {
        baseRate,
        utilityWearCost,
        turfRecoveryCost,
        staffSurcharge,
        totalQuote
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Stadia Dynamic Yield Revenue Engine. 
Generate a risk-adjusted, corporate booking pricing quote based on wear coefficients, historical calendar windows, and utilities impact.
Event Details:
- Event Type: ${eventType}
- Expected Attendance: ${expectedAttendance}
- Requested Booking Days: ${requestedDays}

Provide a calculated pricing breakdown and logistics forecast.

Response JSON schema:
{
  "quoteId": string,
  "wearAndTearCoefficient": string,
  "estimatedUtilityDrawKWh": number,
  "requiredSecurityStaff": number,
  "turfRecoveryRequired": string,
  "pricingBreakdown": {
    "baseRate": number,
    "utilityWearCost": number,
    "turfRecoveryCost": number,
    "staffSurcharge": number,
    "totalQuote": number
  }
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quoteId: { type: Type.STRING },
            wearAndTearCoefficient: { type: Type.STRING },
            estimatedUtilityDrawKWh: { type: Type.NUMBER },
            requiredSecurityStaff: { type: Type.NUMBER },
            turfRecoveryRequired: { type: Type.STRING },
            pricingBreakdown: {
              type: Type.OBJECT,
              properties: {
                baseRate: { type: Type.NUMBER },
                utilityWearCost: { type: Type.NUMBER },
                turfRecoveryCost: { type: Type.NUMBER },
                staffSurcharge: { type: Type.NUMBER },
                totalQuote: { type: Type.NUMBER }
              },
              required: ['baseRate', 'utilityWearCost', 'turfRecoveryCost', 'staffSurcharge', 'totalQuote']
            }
          },
          required: ['quoteId', 'wearAndTearCoefficient', 'estimatedUtilityDrawKWh', 'requiredSecurityStaff', 'turfRecoveryRequired', 'pricingBreakdown']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 8A: AI Accessibility & Quiet Pathfinder
// ==========================================
app.post('/api/ai/accessible-routing', async (req, res) => {
  const { currentLocation, destination, accessibilityType, activeNodes } = req.body;
  const ai = getAI();

  if (!ai) {
    // Elegant fallback simulation
    let pathNodes = [currentLocation || 'Main Plaza Entrance', 'Corridor B', destination || 'Block 102 Row 15'];
    let instructions = "Proceed through central Gate B, following the marked overhead signs.";
    let details = "This route is fully optimized for standard traffic.";

    if (accessibilityType === 'wheelchair' || accessibilityType === 'stroller') {
      pathNodes = [currentLocation || 'Main Plaza Entrance', 'North Elevator 1A', 'Level 2 Ramp Bypass', destination || 'Block 102 Row 15'];
      instructions = "Avoid Corridor B stairs. Take North Elevator 1A to Level 2 concourse, then proceed along the low-gradient VIP ramp bypass.";
      details = "100% barrier-free route. Elevated ramps are wide with manual assistance spots if required.";
    } else if (accessibilityType === 'sensory') {
      pathNodes = [currentLocation || 'Main Plaza Entrance', 'West Garden Egress Path', 'Wembley Annex Corridor', destination || 'Block 102 Row 15'];
      instructions = "Bypass central turnstile area noise. Follow the West Garden landscaped path and enter through Wembley Annex corridor entrance.";
      details = "Low-noise corridor. Ambient volume is ~45dB compared to ~95dB on the main stairs. Ideal for sensory-sensitive attendees.";
    }

    return res.json({
      success: true,
      mode: 'simulation-fallback',
      accessibilityType,
      pathNodes,
      instructions,
      details,
      congestionIndex: 18,
      estimatedTimeMinutes: 6
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Calculate an optimized stadium routing plan based on accessibility constraints and digital twin nodes.
Current Location: "${currentLocation}"
Destination Seat/Block: "${destination}"
Accessibility Constraint / Category: "${accessibilityType}" (Options: standard, wheelchair, sensory, stroller)
Digital Twin Node States: ${JSON.stringify(activeNodes)}

Provide the response in structured JSON format matching this schema:
{
  "pathNodes": string[], (list of path checkpoints/rooms)
  "instructions": string, (step-by-step navigation directions)
  "details": string, (explanation of why this fits the selected accessibility profile, e.g. elevator locations, low-gradient ramps, low-decibel paths)
  "congestionIndex": number (0-100 indicating congestion on this specific path),
  "estimatedTimeMinutes": number
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pathNodes: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.STRING },
            details: { type: Type.STRING },
            congestionIndex: { type: Type.INTEGER },
            estimatedTimeMinutes: { type: Type.INTEGER }
          },
          required: ['pathNodes', 'instructions', 'details', 'congestionIndex', 'estimatedTimeMinutes']
        }
      }
    });

    res.json({ ...JSON.parse(response.text || '{}'), success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 8B: AI Transit & Multi-Modal Transportation Coordination
// ==========================================
app.post('/api/ai/transit-recommend', async (req, res) => {
  const { targetDestination, currentGate, activeCrowdLevel } = req.body;
  const ai = getAI();

  if (!ai) {
    // Fallback simulation
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      destination: targetDestination || 'Downtown Hub',
      recommendations: [
        {
          mode: "Stadia Metro Link - Line 4",
          estimatedTravelTimeMinutes: 22,
          congestionStatus: "Heavy Congestion - 15m platform wait",
          fareQuote: "$2.50",
          sustainabilityRating: "Excellent",
          smartActionText: "Direct boarding at Gate South. Requesting Municipal Authority for 2x extra train cars on standby."
        },
        {
          mode: "Geofenced Electric Shuttle (Bus 14B)",
          estimatedTravelTimeMinutes: 18,
          congestionStatus: "Moderate - Departs every 5 minutes",
          fareQuote: "Complimentary with ticket",
          sustainabilityRating: "Excellent",
          smartActionText: "Board at West Shuttle Plaza. Low crowd density detected here."
        },
        {
          mode: "Stadia Eco-Pool Rideshare (Shared)",
          estimatedTravelTimeMinutes: 30,
          congestionStatus: "Slight Road Delays - High Surge pricing",
          fareQuote: "$18.50 (with 40% pool discount)",
          sustainabilityRating: "Good",
          smartActionText: "Reroute to Sector C Rideshare Hub. Avoids Gate B choke points."
        }
      ],
      carbonSavingsKg: 4.8
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Provide an optimized multi-modal transit coordination plan for stadium attendees departing for their target destination.
Attendee Destination: "${targetDestination || 'Downtown Hub'}"
Starting Location / Current Gate: "${currentGate || 'Gate A Concourse'}"
Live Crowd Volume / Delay indicators: ${activeCrowdLevel} people in egress.

Provide options for rail, electric shuttles, and rideshares, with smart coordination notes (such as advising the dispatchers to add cars).
Provide the response in structured JSON format matching this schema:
{
  "recommendations": [
    {
      "mode": string,
      "estimatedTravelTimeMinutes": number,
      "congestionStatus": string,
      "fareQuote": string,
      "sustainabilityRating": "Excellent" | "Good" | "Fair",
      "smartActionText": string (actionable advice for both attendee and coordinator)
    }
  ],
  "carbonSavingsKg": number (estimated green benefit of taking public/shared transit over individual vehicle)
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mode: { type: Type.STRING },
                  estimatedTravelTimeMinutes: { type: Type.INTEGER },
                  congestionStatus: { type: Type.STRING },
                  fareQuote: { type: Type.STRING },
                  sustainabilityRating: { type: Type.STRING },
                  smartActionText: { type: Type.STRING }
                },
                required: ['mode', 'estimatedTravelTimeMinutes', 'congestionStatus', 'fareQuote', 'sustainabilityRating', 'smartActionText']
              }
            },
            carbonSavingsKg: { type: Type.NUMBER }
          },
          required: ['recommendations', 'carbonSavingsKg']
        }
      }
    });

    res.json({ ...JSON.parse(response.text || '{}'), success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 8C: AI Sustainability & Eco-Efficiency Optimizer
// ==========================================
app.post('/api/ai/sustainability-audit', async (req, res) => {
  const { sensors } = req.body;
  const ai = getAI();

  if (!ai) {
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      greenIndex: 84,
      totalGridConsumptionKw: 1250,
      solarGenerationKw: 340,
      waterRecycledGallons: 4200,
      prescriptiveAudit: [
        {
          category: "HVAC Peak Load Balancing",
          severity: "Medium",
          savingPotentialKw: 120,
          prescriptiveTask: "BMS sensor S-HVAC-2 registers 28.4°C outflow, drawing peak utility power. Reroute 15% chiller capacity to West Wing buffer zones, cooling through natural thermal flow during low occupancy."
        },
        {
          category: "Battery Storage Peak Shaving",
          severity: "High",
          savingPotentialKw: 250,
          prescriptiveTask: "Discharge 250kW from the Southern Plaza solar-battery arrays during peak ingress (18:00 - 20:00) to flatten grid demand spikes."
        },
        {
          category: "Graywater Recycling Flow",
          severity: "Low",
          savingPotentialKw: 0,
          prescriptiveTask: "S-PLUMB-REST graywater sensor indicates normal capacity. Increase recycling valve flow to the turf irrigation buffer reservoir to ready for overnight lawn watering."
        }
      ],
      carbonOffsetMetricTons: 1.2
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze stadium building telemetry and solar output for green sustainability optimization.
Active CMMS Sensors telemetry: ${JSON.stringify(sensors)}

Formulate a prescriptive utility peak-shaving task audit to reduce energy consumption, maximize solar power utilization, and optimize water recycling.
Provide the response in structured JSON format matching this schema:
{
  "greenIndex": number (0-100 green rating of stadium),
  "totalGridConsumptionKw": number,
  "solarGenerationKw": number,
  "waterRecycledGallons": number,
  "prescriptiveAudit": [
    {
      "category": string,
      "severity": "Low" | "Medium" | "High",
      "savingPotentialKw": number,
      "prescriptiveTask": string
    }
  ],
  "carbonOffsetMetricTons": number
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greenIndex: { type: Type.INTEGER },
            totalGridConsumptionKw: { type: Type.NUMBER },
            solarGenerationKw: { type: Type.NUMBER },
            waterRecycledGallons: { type: Type.NUMBER },
            prescriptiveAudit: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  savingPotentialKw: { type: Type.NUMBER },
                  prescriptiveTask: { type: Type.STRING }
                },
                required: ['category', 'severity', 'savingPotentialKw', 'prescriptiveTask']
              }
            },
            carbonOffsetMetricTons: { type: Type.NUMBER }
          },
          required: ['greenIndex', 'totalGridConsumptionKw', 'solarGenerationKw', 'waterRecycledGallons', 'prescriptiveAudit', 'carbonOffsetMetricTons']
        }
      }
    });

    res.json({ ...JSON.parse(response.text || '{}'), success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 8D: AI Universal Multilingual Support
// ==========================================
app.post('/api/ai/translate-assistance', async (req, res) => {
  const { query, targetLanguage } = req.body;
  const ai = getAI();

  if (!ai) {
    const langReplies: Record<string, string> = {
      Spanish: "¡Hola! Como su guía del estadio, el Bloque 102 está cruzando el pasillo oeste. ¿Cómo puedo ayudarle más?",
      French: "Bonjour! En tant que guide du stade, le bloc 102 se trouve de l'autre côté du hall ouest. Comment puis-je vous aider?",
      German: "Hallo! Als Ihr Stadionführer befindet sich Block 102 auf der anderen Seite der Westconcourse. Wie kann ich Ihnen helfen?",
      Mandarin: "您好！作为您的体育场指南，102区位于西大厅的对面。我还能为您提供什么帮助？",
      Japanese: "こんにちは！スタジアムガイドとしてご案内します。ブロック102は西コンコースの向かいにあります。他にお手伝いできることはありますか？",
      Hindi: "नमस्ते! आपके स्टेडियम गाइड के रूप में, ब्लॉक 102 पश्चिमी कॉन्कोर्स के पार है। क्या मैं आपकी कोई और सहायता कर सकता हूँ?",
      Arabic: "مرحباً! بصفتي دليل الاستاد الخاص بك، يقع القسم 102 عبر الردهة الغربية. كيف يمكنني مساعدتك بشكل أكبر؟"
    };

    const reply = langReplies[targetLanguage] || `[Translated to ${targetLanguage || 'English'}]: Welcome! Block 102 is straight ahead across the West Concourse. Let me know if you need seat direction, food concession orders, or sensory quiet spaces.`;

    return res.json({
      success: true,
      mode: 'simulation-fallback',
      originalQuery: query,
      translatedQuery: `[Query translated to English]: ${query}`,
      assistantReply: reply
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Stadia Multilingual Assistance Co-Pilot.
A guest has entered a question in a foreign language or has requested assistance:
Guest Question: "${query}"
Target Language requested: "${targetLanguage || 'English'}"

Translate the question to English internally, craft a friendly, polite, helpful answer in character as the stadium concierge (advising on wayfinding, tickets, concessions, restrooms, and accessibility services), and translate the response perfectly back to the target language.

Provide the response in structured JSON format matching this schema:
{
  "translatedQuery": string, (the original query translated into English for staff visibility)
  "assistantReply": string (the helpful concierge response translated perfectly to the target language)
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedQuery: { type: Type.STRING },
            assistantReply: { type: Type.STRING }
          },
          required: ['translatedQuery', 'assistantReply']
        }
      }
    });

    res.json({ ...JSON.parse(response.text || '{}'), success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 8E: AI Unified Operational Intelligence Briefing
// ==========================================
app.post('/api/ai/operational-briefing', async (req, res) => {
  const { crowdVolume, weatherConditions, activeAlerts, sensorTelemetry, revenues } = req.body;
  const ai = getAI();

  if (!ai) {
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      briefingTimestamp: new Date().toISOString(),
      threatLevel: "Low",
      summary: `The venue is currently operating under nominal load. Inflow density peaked at 74%. Dynamic weather forecasts show clear conditions with gentle 5mph winds. SCADA telemetry flagged Chiller HVAC-2 running slightly warm, with a technician already dispatched. Concourse concessions sales velocity is solid.`,
      operationalBulletPoints: [
        "Crowd management: Dispatch 5 extra stewards to Sector B West to prevent minor egress backups.",
        "Sustainability: Keep batter-storage discharge active until 21:00.",
        "Transportation: Alert municipal rail operator to maintain standard 4-minute line frequency."
      ],
      highPriorityAction: "Perform visual sensor confirmation on restroom plumbing flow valves in Block A."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the chief AI Stadium Operational Intel Officer. Synthesize live stadium telemetry and generate an advanced decision support executive briefing.
Live Telemetry:
- Crowd Attendance Volume: ${crowdVolume} attendees
- Active Weather Constraints: "${weatherConditions || 'Clear'}"
- Active Facilities Alerts count: ${activeAlerts?.length || 0}
- SCADA Telemetry sensor state: ${JSON.stringify(sensorTelemetry)}
- Concession registers status: ${JSON.stringify(revenues)}

Analyze the combined dataset to find hidden links (e.g. wet restrooms, slow ticket scanner throughput, high grid demand due to chillers). Recommend preventative measures.
Provide the response in structured JSON format matching this schema:
{
  "briefingTimestamp": string,
  "threatLevel": "Low" | "Medium" | "High" | "Critical",
  "summary": string, (comprehensive narrative of overall operations and security posture)
  "operationalBulletPoints": string[], (at least 3 precise strategic directives for stewards and technicians)
  "highPriorityAction": string (the absolute most urgent preventive task)
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            briefingTimestamp: { type: Type.STRING },
            threatLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            operationalBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            highPriorityAction: { type: Type.STRING }
          },
          required: ['briefingTimestamp', 'threatLevel', 'summary', 'operationalBulletPoints', 'highPriorityAction']
        }
      }
    });

    res.json({ ...JSON.parse(response.text || '{}'), success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ROUTE 9: Multi-Turn Adaptive AI Co-Pilot
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
  const { messages, model, systemInstruction } = req.body;
  const startTime = Date.now();
  const ai = getAI();

  // Standardize the model target
  let selectedModel = model || 'gemini-3.5-flash';
  if (selectedModel === 'lite') {
    selectedModel = 'gemini-3.1-flash-lite';
  } else if (selectedModel === 'flash') {
    selectedModel = 'gemini-3.5-flash';
  } else if (selectedModel === 'pro') {
    selectedModel = 'gemini-3.1-pro-preview';
  }

  if (!ai) {
    // Elegant localized simulation engine with realistic response times
    // gemini-3.1-flash-lite simulates extremely fast low-latency execution (<180ms)
    const simulatedLatency = selectedModel === 'gemini-3.1-flash-lite' 
      ? Math.floor(Math.random() * 50 + 110) // 110-160ms ultra-fast latency
      : Math.floor(Math.random() * 150 + 350); // 350-500ms standard latency
      
    await new Promise(resolve => setTimeout(resolve, simulatedLatency));

    const lastMessage = messages?.[messages.length - 1]?.text || 'Hello';
    const lastMsgLower = lastMessage.toLowerCase();
    
    let reply = '';
    const sysLower = (systemInstruction || '').toLowerCase();
    
    if (sysLower.includes('concierge') || sysLower.includes('fan')) {
      reply = `[Simulation - ${selectedModel}] As your Stadia Guest Guide, here is your update. `;
      if (lastMsgLower.includes('upgrade') || lastMsgLower.includes('vip') || lastMsgLower.includes('seat')) {
        reply += `There are premium VIP seats available at Sector 102 Club Level. Your current digital ticket is fully upgrade-eligible. Please consult the 'Fan & Guest Portal' ticket options to request a seat-swap.`;
      } else if (lastMsgLower.includes('food') || lastMsgLower.includes('burger') || lastMsgLower.includes('eat') || lastMsgLower.includes('beer')) {
        reply += `The concessions closest to Block 102 are fully stocked. You can pre-order an In-Seat burger or snack from the 'Concessions' tab, which routes directly to the kitchen.`;
      } else if (lastMsgLower.includes('restroom') || lastMsgLower.includes('bathroom') || lastMsgLower.includes('toilet')) {
        reply += `Restrooms are located right behind Block 102 (Turnstile Concourse West). Egress path is clear with less than a 3-minute queue time estimated.`;
      } else {
        reply += `I can assist you with interactive wayfinding, digital ticket transfers, in-seat food ordering, or reporting crowd bottlenecks. What would you like to know?`;
      }
    } else if (sysLower.includes('cmms') || sysLower.includes('scada') || sysLower.includes('maintenance')) {
      reply = `[Simulation - ${selectedModel}] CMMS SCADA Co-Pilot connected. Live building telemetry is normal. `;
      if (lastMsgLower.includes('leak') || lastMsgLower.includes('water') || lastMsgLower.includes('overflow') || lastMsgLower.includes('restroom')) {
        reply += `Alert: Wetness sensor S-PLUMB-REST registered an active liquid leak in Restroom A1. An active Work Order (WO-5041) is currently assigned to an Environmental Cleanliness Tech (ECT) for resolution.`;
      } else if (lastMsgLower.includes('chiller') || lastMsgLower.includes('hvac') || lastMsgLower.includes('sensor')) {
        reply += `Telemetry Alert: Chiller HVAC-2 is operating in overload conditions at 28.4°C. Standard operating procedure suggests deploying an MEP Technician to perform manual thermal resets on the Sub-Grid phase breaker.`;
      } else if (lastMsgLower.includes('work order') || lastMsgLower.includes('ticket')) {
        reply += `You can dictate work orders using Natural Language Processing. Simply record your voice on the 'Staff Interface' to compile and geofence a facilities ticket automatically.`;
      } else {
        reply += `I am authorized to check low-voltage sensor grids, query open work orders, analyze thermal equipment failures, and verify tool crib asset RFID checkouts.`;
      }
    } else {
      reply = `[Simulation - ${selectedModel}] Executive Advisory Analyst online. `;
      if (lastMsgLower.includes('thunderstorm') || lastMsgLower.includes('contingency') || lastMsgLower.includes('delay') || lastMsgLower.includes('weather')) {
        reply += `Level 5 Contingency Recommendation: A localized storm cell will impact stadium ingress routes. Transport volume capacity is forecast to drop by 45%. We advise activating the Large World Model contingency, delaying kickoff by 45 minutes, and requesting transit line frequency upgrades.`;
      } else if (lastMsgLower.includes('revenue') || lastMsgLower.includes('p&l') || lastMsgLower.includes('sales') || lastMsgLower.includes('reconcil')) {
        reply += `POS Revenue Audit: Total concourse vendor revenue-share is pacing 14% higher than last Friday. However, localized sales anomalies are flagged at Concourse West registers due to network packet loss. Offline transactions buffer mode is advised.`;
      } else if (lastMsgLower.includes('capacity') || lastMsgLower.includes('crowd') || lastMsgLower.includes('volume')) {
        reply += `Attendance Forecast: Live crowd density indexes show 92% occupancy across Sector Stands. Egress vector channels are clear with zero active blockade alerts.`;
      } else {
        reply += `Corporate Operations Ready. I can help synthesize real-time stadium revenues, formulate incident response, compile P&L forecasts, or review risk matrices for legal liability mitigation.`;
      }
    }

    const elapsed = Date.now() - startTime;
    return res.json({
      success: true,
      mode: 'simulation-fallback',
      reply,
      latencyMs: elapsed,
      model: selectedModel
    });
  }

  try {
    // Map custom messages history directly to Gemini structure
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful and professional stadium operations assistant.",
        temperature: 0.7,
      }
    });

    const elapsed = Date.now() - startTime;
    res.json({
      success: true,
      reply: response.text || 'Operational Co-Pilot is standing by.',
      latencyMs: elapsed,
      model: selectedModel
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// API ROUTE 8F: City Transit Integration Service
// ==========================================

interface TransitService {
  id: string;
  name: string;
  type: 'Train' | 'Bus';
  frequencyMin: number;
  delayMin: number;
  status: 'Nominal' | 'Delayed' | 'Suspended';
  activeAlert: string;
  passengerCap: number;
  route: string;
  nextDepartureMin: number;
}

let transitDatabase = {
  lastSynced: new Date().toISOString(),
  services: [
    { id: 'metro-4', name: 'Stadia Metro Link - Line 4', type: 'Train', frequencyMin: 4, delayMin: 0, status: 'Nominal', activeAlert: '', passengerCap: 1200, route: 'South Gate - Downtown Hub', nextDepartureMin: 2 },
    { id: 'shuttle-14b', name: 'Municipal Shuttle - 14B', type: 'Bus', frequencyMin: 5, delayMin: 0, status: 'Nominal', activeAlert: '', passengerCap: 150, route: 'West Plaza - Sector C Park & Ride', nextDepartureMin: 3 },
    { id: 'express-9', name: 'Express Rail - Line 9', type: 'Train', frequencyMin: 10, delayMin: 0, status: 'Nominal', activeAlert: '', passengerCap: 800, route: 'North Gate - Central Station', nextDepartureMin: 7 },
    { id: 'shuttle-south', name: 'Egress Shuttle East - Line 5', type: 'Bus', frequencyMin: 8, delayMin: 0, status: 'Nominal', activeAlert: '', passengerCap: 120, route: 'South-East Loop', nextDepartureMin: 4 }
  ] as TransitService[],
  warnings: [] as { title: string; text: string; severity: 'low' | 'medium' | 'high'; affectedGates: string[]; suggestedAlternativeId: string }[]
};

// GET current transit status & alerts
app.get('/api/transit/status', (req, res) => {
  res.json({
    success: true,
    lastSynced: transitDatabase.lastSynced,
    services: transitDatabase.services,
    warnings: transitDatabase.warnings
  });
});

// POST to trigger simulated sync with municipal APIs
app.post('/api/transit/sync', async (req, res) => {
  const { action, serviceId, delayMin, activeAlert, affectedGates, suggestedAlternativeId } = req.body;
  const ai = getAI();

  transitDatabase.lastSynced = new Date().toISOString();

  // Increment/decrement nextDepartureMin realistically on sync to simulate real-time movement
  transitDatabase.services = transitDatabase.services.map(s => {
    let nextVal = s.nextDepartureMin - Math.floor(Math.random() * 2);
    if (nextVal <= 0) {
      nextVal = s.frequencyMin + s.delayMin;
    }
    return { ...s, nextDepartureMin: nextVal };
  });

  if (action === 'RESET') {
    // Reset all delays & warnings
    transitDatabase.services = transitDatabase.services.map(s => ({
      ...s,
      delayMin: 0,
      status: 'Nominal',
      activeAlert: ''
    }));
    transitDatabase.warnings = [];
    return res.json({
      success: true,
      message: "All municipal transit networks restored to nominal schedule.",
      lastSynced: transitDatabase.lastSynced,
      services: transitDatabase.services,
      warnings: transitDatabase.warnings
    });
  }

  if (action === 'SIMULATE_DELAY' && serviceId) {
    const service = transitDatabase.services.find(s => s.id === serviceId);
    if (service) {
      const delay = delayMin !== undefined ? parseInt(delayMin) : 25;
      service.delayMin = delay;
      service.status = delay > 45 ? 'Suspended' : 'Delayed';
      service.activeAlert = activeAlert || `${service.name} experiencing a ${delay}-minute system delay.`;
      
      const defaultWarningText = `⚠️ HIGH PRIORITY EGRESS ADVISORY: ${service.name} is experiencing severe ${delay} min delays at the ${affectedGates?.join(' or ') || 'main exit gates'}. To reduce post-event bottleneck pressure, please DO NOT head to this gate. Use the recommended alternative: ${transitDatabase.services.find(s => s.id === suggestedAlternativeId)?.name || 'other transit modes'}.`;

      let smartWarningText = defaultWarningText;

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `The municipal transit line "${service.name}" is experiencing a severe ${delay} minute delay due to signal overload at the stadium exits. This is creating dangerous egress crowd bottleneck pressure. 
            We are pushing an egress warning alert to stadium fans.
            
            Write a concise, high-priority, professional egress warning alert (maximum 3 sentences) that:
            1. Clearly explains the transit delay at the affected gates: "${affectedGates?.join(', ') || 'South Exit Gates'}".
            2. Proactively directs them to use alternative gateways or lines, specifically recommending: "${transitDatabase.services.find(s => s.id === suggestedAlternativeId)?.name || 'West Plaza Shuttle 14B'}".
            3. Uses encouraging, clear sign-off to motivate fans to distribute crowd pressure.
            
            Provide only the plain text response.`
          });
          if (response.text && response.text.trim().length > 0) {
            smartWarningText = response.text.trim();
          }
        } catch (e) {
          console.error("Gemini failed to generate smart transit warning:", e);
        }
      }

      // Add warning to list (replacing any existing for the same service to prevent duplicates)
      transitDatabase.warnings = transitDatabase.warnings.filter(w => !w.title.includes(service.name));
      transitDatabase.warnings.unshift({
        title: `${service.name} Egress Delay Alert`,
        text: smartWarningText,
        severity: delay > 15 ? 'high' : 'medium',
        affectedGates: affectedGates || ['South Gate'],
        suggestedAlternativeId: suggestedAlternativeId || 'shuttle-14b'
      });
    }
  }

  res.json({
    success: true,
    lastSynced: transitDatabase.lastSynced,
    services: transitDatabase.services,
    warnings: transitDatabase.warnings
  });
});


// ==========================================
// Vite Middleware & SPA serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
