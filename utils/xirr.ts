// A simplified XIRR implementation
// Based on https://gist.github.com/ghalimi/4590438

function XNPV(rate: number, values: number[], dates: Date[]): number {
    let xnpv = 0.0;
    for (let i = 0; i < values.length; i++) {
        const time = (dates[i].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
        xnpv += values[i] / Math.pow(1 + rate, time / 365.0);
    }
    return xnpv;
}

function dXNPV(rate: number, values: number[], dates: Date[]): number {
    let dxnpv = 0.0;
    for (let i = 0; i < values.length; i++) {
        const time = (dates[i].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
        if (time > 0) {
            dxnpv -= (values[i] * time) / (365.0 * Math.pow(1 + rate, time / 365.0 + 1));
        }
    }
    return dxnpv;
}

export function calculateXIRR(values: number[], dates: Date[], guess = 0.1): number {
    if (values.length !== dates.length || values.length === 0) {
        return 0; // Invalid input
    }
    
    // Ensure there is at least one positive and one negative value
    const hasPositive = values.some(v => v > 0);
    const hasNegative = values.some(v => v < 0);
    if (!hasPositive || !hasNegative) {
        return 0;
    }

    const maxIterations = 100;
    const tolerance = 1.0e-7;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
        const xnpv = XNPV(rate, values, dates);
        const dxnpv = dXNPV(rate, values, dates);

        if (Math.abs(xnpv) < tolerance) {
            return rate * 100; // Return as percentage
        }
        
        if (dxnpv === 0) break; // Avoid division by zero

        rate = rate - xnpv / dxnpv;
    }

    return 0; // Failed to converge
}
