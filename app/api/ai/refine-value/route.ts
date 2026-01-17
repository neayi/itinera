// API Route: Refine indicator value through dialogue
import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { indicatorCalculator } from '@/lib/ai/indicator-calculator';
import { System } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { systemId, stepIndex, interventionIndex, indicatorKey, userMessage } = body;

    // Validate input
    if (!systemId || stepIndex === undefined || interventionIndex === undefined || !indicatorKey || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: systemId, stepIndex, interventionIndex, indicatorKey, userMessage' },
        { status: 400 }
      );
    }

    // Check if AI is enabled
    if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'AI Assistant is not enabled' },
        { status: 403 }
      );
    }

    // Fetch system data
    const system = await queryOne<System>(
      'SELECT * FROM systems WHERE id = ?',
      [systemId]
    );

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    // Parse JSON data
    const systemData = typeof system.json === 'string' 
      ? JSON.parse(system.json) 
      : system.json;

    if (!systemData || !systemData.steps) {
      return NextResponse.json(
        { error: 'Invalid system data structure' },
        { status: 400 }
      );
    }

    // Validate indices
    if (stepIndex < 0 || stepIndex >= systemData.steps.length) {
      return NextResponse.json(
        { error: 'Invalid stepIndex' },
        { status: 400 }
      );
    }

    const step = systemData.steps[stepIndex];
    if (!step.interventions || interventionIndex < 0 || interventionIndex >= step.interventions.length) {
      return NextResponse.json(
        { error: 'Invalid interventionIndex' },
        { status: 400 }
      );
    }

    // Get existing conversation
    const intervention = step.interventions[interventionIndex];
    const valueEntry = intervention.values?.find((v: any) => v.key === indicatorKey);
    const existingConversation = valueEntry?.conversation || [];

    if (existingConversation.length === 0) {
      return NextResponse.json(
        { error: 'No existing conversation found. Calculate the value first.' },
        { status: 400 }
      );
    }

    // Refine value using AI
    const result = await indicatorCalculator.refineValue(
      {
        systemData,
        stepIndex,
        interventionIndex,
        indicatorKey,
      },
      userMessage,
      existingConversation
    );

    // Update system data with refined value
    if (!valueEntry) {
      return NextResponse.json(
        { error: 'Value entry not found' },
        { status: 400 }
      );
    }

    // Update the value with refined results
    valueEntry.value = result.value;
    valueEntry.status = result.status || 'ia'; // Use status from AI ('ia' or 'n/a'), default to 'ia'
    valueEntry.confidence = result.confidence;
    valueEntry.conversation = result.conversation;

    // Save updated system data
    await query(
      'UPDATE systems SET json = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(systemData), systemId]
    );

    // Return result
    return NextResponse.json({
      value: result.value,
      confidence: result.confidence,
      conversation: result.conversation,
      updatedSystemData: systemData,
    });

  } catch (error: any) {
    console.error('Error refining value:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refine value',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
