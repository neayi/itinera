// API Route: Calculate single indicator using AI
import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { indicatorCalculator } from '@/lib/ai/indicator-calculator';
import { System } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { systemId, stepIndex, interventionIndex, indicatorKey } = body;

    // Validate input
    if (!systemId || stepIndex === undefined || interventionIndex === undefined || !indicatorKey) {
      return NextResponse.json(
        { error: 'Missing required fields: systemId, stepIndex, interventionIndex, indicatorKey' },
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

    // Calculate indicator using AI
    const result = await indicatorCalculator.calculateIndicator({
      systemData,
      stepIndex,
      interventionIndex,
      indicatorKey,
    });

    // Update system data with calculated value
    const intervention = step.interventions[interventionIndex];
    
    // Ensure values array exists
    if (!intervention.values) {
      intervention.values = [];
    }

    // Find or create the value entry
    let valueEntry = intervention.values.find((v: any) => v.key === indicatorKey);
    if (!valueEntry) {
      valueEntry = { key: indicatorKey, value: 0 };
      intervention.values.push(valueEntry);
    }

    // Update the value with AI results
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
    console.error('Error calculating indicator:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate indicator',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
