import { Request, Response } from 'express';
import { actionSchema } from '../config/actions';
import { runTerminalCommand } from '../utils/terminal';
import { db } from '../config/firebase';

const actionsCollection = db.collection('actions');

// Define a mapping from action names to Python script paths
const actionScriptMap: { [key: string]: string } = {
  "monitor_darknet_marketplace": "./path/to/your/monitor_darknet_marketplace.py", // Replace with actual paths
  "discover_tor_hidden_services": "./path/to/your/discover_tor_hidden_services.py", // Replace with actual paths
  "analyze_crypto_mixing_trends": "./path/to/your/analyze_crypto_mixing_trends.py", // Replace with actual paths
  "identify_privacy_vulnerabilities": "./path/to/your/identify_privacy_vulnerabilities.py", // Replace with actual paths
  "exploit_surface_analysis": "./path/to/your/exploit_surface_analysis.py", // Replace with actual paths
  "scrape_competitor_email_campaigns": "./path/to/your/scrape_competitor_email_campaigns.py", // Replace with actual paths
  "market_signal_noise_discriminator": "./path/to/your/market_signal_noise_discriminator.py", // Replace with actual paths
  "generate_deepfake_audio_sample": "./path/to/your/generate_deepfake_audio_sample.py", // Replace with actual paths
  "automate_tax_arbitrage_structures": "./path/to/your/automate_tax_arbitrage_structures.py", // Replace with actual paths
  // Add mappings for other actions as needed
};

interface FirestoreAction {
    id: string;
    enabled: boolean;
    status: string;
    lastRun: Date | null;
    lastResult: string | null;
}

export const listActions = async (req: Request, res: Response) => {
  try {
    const actionsSnapshot = await actionsCollection.get();
    const actionsData = actionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreAction[];

    const mergedActions = actionSchema.map(schemaAction => {
      const firestoreAction = actionsData.find(a => a.id === schemaAction.name);
      return {
        ...schemaAction,
        enabled: firestoreAction ? firestoreAction.enabled : false,
        status: firestoreAction ? firestoreAction.status : 'idle',
        lastRun: firestoreAction ? firestoreAction.lastRun : null,
        lastResult: firestoreAction ? firestoreAction.lastResult : null,
      };
    });

    res.json(mergedActions);
  } catch (error) {
    console.error('Error listing actions from Firestore:', error);
    res.status(500).json({ error: 'Failed to list actions' });
  }
};

export const triggerAction = async (req: Request, res: Response) => {
  const { actionName, parameters } = req.body;

  const action = actionSchema.find(a => a.name === actionName);

  if (!action) {
    return res.status(404).json({ error: 'Action not found' });
  }

  // TODO: Add validation for parameters against the action's schema

  try {
    const actionDoc = await actionsCollection.doc(actionName).get();
    if (actionDoc.exists && actionDoc.data()?.enabled === false) {
      return res.status(400).json({ error: 'Action is disabled' });
    }

    // Update status to running in Firestore
    await actionsCollection.doc(actionName).set({
      status: 'running',
      lastRun: new Date(),
    }, { merge: true });

    // Get the script path from the mapping
    const scriptPath = actionScriptMap[actionName];
    if (!scriptPath) {
      await actionsCollection.doc(actionName).set({
        status: 'error',
        lastResult: `No script path defined for action: ${actionName}`,
      }, { merge: true });
      return res.status(500).json({ error: `No script path defined for action: ${actionName}` });
    }

    // Construct the command to run the Python script
    // You'll need to decide how to pass parameters to your scripts.
    // Common ways include command-line arguments or environment variables.
    // This example uses command-line arguments (you might need to adjust this).
    const paramsArgs = Object.entries(parameters || {}).map(([key, value]) => `--${key}=${value}`).join(' ');
    const command = `python ${scriptPath} ${paramsArgs}`;

    console.log(`Running command: ${command}`);

    // Execute the Python script
    const scriptOutput = await runTerminalCommand(command);

    // Update status and result in Firestore based on script output
    const resultStatus = 'completed'; // Assume completed on successful execution
    const resultDetails = scriptOutput; // Store script output as result details

    await actionsCollection.doc(actionName).set({
      status: resultStatus,
      lastResult: resultDetails,
    }, { merge: true });

    res.json({ success: true, message: `Action ${actionName} triggered`, output: scriptOutput });

  } catch (error: any) {
    console.error('Error triggering action or updating status:', error);
    // Update status to error in Firestore
    await actionsCollection.doc(actionName).set({
      status: 'error',
      lastResult: error.message || 'An unknown error occurred',
    }, { merge: true });
    res.status(500).json({ error: 'Failed to trigger action', details: error.message });
  }
};

export const getActionStatus = async (req: Request, res: Response) => {
  const { actionName } = req.params;

  try {
    const actionDoc = await actionsCollection.doc(actionName).get();

    if (!actionDoc.exists) {
      const schemaAction = actionSchema.find(a => a.name === actionName);
      if (schemaAction) {
        return res.json({
          actionName,
          status: 'idle',
          enabled: false,
          lastRun: null,
          lastResult: null,
        });
      } else {
         return res.status(404).json({ error: 'Action not found' });
      }
    }

    res.json({ actionName, ...actionDoc.data() });
  } catch (error) {
    console.error('Error getting action status from Firestore:', error);
    res.status(500).json({ error: 'Failed to get action status' });
  }
};

export const toggleAction = async (req: Request, res: Response) => {
  const { actionName } = req.params;
  const { enable } = req.body;

  if (typeof enable !== 'boolean') {
    return res.status(400).json({ error: '"enable" must be a boolean' });
  }

  const action = actionSchema.find(a => a.name === actionName);

  if (!action) {
    return res.status(404).json({ error: 'Action not found' });
  }

  try {
    await actionsCollection.doc(actionName).set({
      enabled: enable,
    }, { merge: true });

    res.json({ success: true, message: `Action ${actionName} toggled ${enable ? 'on' : 'off'}` });
  } catch (error) {
    console.error('Error toggling action in Firestore:', error);
    res.status(500).json({ error: 'Failed to toggle action' });
  }
};
