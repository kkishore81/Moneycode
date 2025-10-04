import React, { useState } from 'react';
import { WillPersonalInfo, Executor, Beneficiary, Asset, Guardian } from '../types';

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                <React.Fragment key={step}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        {step}
                    </div>
                    {step < totalSteps && <div className={`flex-1 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
    </div>
);

const generateWillText = (data: {
    personalInfo: WillPersonalInfo;
    executor: Executor;
    beneficiaries: Beneficiary[];
    guardian: Guardian;
}): string => {
    const { personalInfo, executor, beneficiaries, guardian } = data;

    let willContent = `
LAST WILL AND TESTAMENT
OF
${personalInfo.fullName.toUpperCase()}

I, ${personalInfo.fullName}, residing at ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} - ${personalInfo.pincode}, being of sound mind, not acting under duress or undue influence, do hereby make, publish and declare this to be my Last Will and Testament, revoking all former wills and codicils made by me.

ARTICLE I: APPOINTMENT OF EXECUTOR
I appoint ${executor.fullName}, my ${executor.relationship}, residing at ${executor.address}, as the Executor of this Will. If my Executor is unable or unwilling to serve, I declare that no replacement shall be appointed.

ARTICLE II: DISPOSITION OF ASSETS
I give, devise, and bequeath my property to the following beneficiaries:
`;

    beneficiaries.forEach(b => {
        willContent += `\nTo my ${b.relationship}, ${b.fullName}, I bequeath the following:\n`;
        b.assets.forEach(a => {
            willContent += `- ${a.description}\n`;
        });
    });

    if (guardian.fullName) {
        willContent += `
ARTICLE III: GUARDIANSHIP FOR MINOR CHILDREN
In the event that I am the sole surviving parent of minor children, I appoint ${guardian.fullName}, my ${guardian.relationship}, as Guardian of said minor children.
`;
    }

    willContent += `
IN WITNESS WHEREOF, I have subscribed my name this ______ day of ___________, 20___.

_________________________
(Testator's Signature)

_________________________
(Testator's Printed Name)

ATTESTATION
On the date written above, the Testator, ${personalInfo.fullName}, declared to us, the undersigned, that this instrument was their Last Will and Testament and requested us to act as witnesses to it. The Testator signed this Will in our presence, all of us being present at the same time. We now, in the Testator's presence and in the presence of each other, subscribe our names as witnesses.

Witness 1:
Signature: ____________________
Name: ________________________
Address: ______________________

Witness 2:
Signature: ____________________
Name: ________________________
Address: ______________________
`;
    return willContent;
};


export const WillCreator: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [personalInfo, setPersonalInfo] = useState<WillPersonalInfo>({ fullName: '', address: '', city: '', state: '', pincode: '' });
    const [executor, setExecutor] = useState<Executor>({ fullName: '', relationship: '', address: '' });
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([{ id: `b${Date.now()}`, fullName: '', relationship: '', assets: [{ id: `a${Date.now()}`, description: '' }] }]);
    const [guardian, setGuardian] = useState<Guardian>({ fullName: '', relationship: '' });

    const handleDownload = () => {
        const willText = generateWillText({ personalInfo, executor, beneficiaries, guardian });
        const blob = new Blob([willText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'My_Last_Will_and_Testament.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleBeneficiaryChange = (id: string, field: keyof Omit<Beneficiary, 'id' | 'assets'>, value: string) => {
        setBeneficiaries(beneficiaries.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleAssetChange = (beneficiaryId: string, assetId: string, value: string) => {
        setBeneficiaries(beneficiaries.map(b => b.id === beneficiaryId ? { ...b, assets: b.assets.map(a => a.id === assetId ? { ...a, description: value } : a) } : b));
    };

    const addBeneficiary = () => {
        setBeneficiaries([...beneficiaries, { id: `b${Date.now()}`, fullName: '', relationship: '', assets: [{ id: `a${Date.now()}`, description: '' }] }]);
    };

    const removeBeneficiary = (id: string) => {
        setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    };

    const addAsset = (beneficiaryId: string) => {
        setBeneficiaries(beneficiaries.map(b => b.id === beneficiaryId ? { ...b, assets: [...b.assets, { id: `a${Date.now()}`, description: '' }] } : b));
    };
    
    const removeAsset = (beneficiaryId: string, assetId: string) => {
         setBeneficiaries(beneficiaries.map(b => b.id === beneficiaryId ? { ...b, assets: b.assets.filter(a => a.id !== assetId) } : b));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Will Creator</h2>
            <p className="text-yellow-400 bg-yellow-900/50 border border-yellow-700 p-3 rounded-lg text-sm mb-6">
                <strong>Disclaimer:</strong> This tool helps you create a basic will for informational purposes only. It is not a substitute for legal advice from a qualified professional.
            </p>

            <StepIndicator currentStep={currentStep} totalSteps={5} />

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Step 1: Your Personal Information</h3>
                    <FormInput label="Full Name" value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} />
                    <FormInput label="Full Address" value={personalInfo.address} onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })} />
                    <div className="grid grid-cols-3 gap-4">
                        <FormInput label="City" value={personalInfo.city} onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })} />
                        <FormInput label="State" value={personalInfo.state} onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })} />
                        <FormInput label="Pincode" value={personalInfo.pincode} onChange={(e) => setPersonalInfo({ ...personalInfo, pincode: e.target.value })} />
                    </div>
                </div>
            )}

            {/* Step 2: Executor */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Step 2: Appoint an Executor</h3>
                    <p className="text-gray-400">The Executor is the person who will be responsible for carrying out your wishes.</p>
                    <FormInput label="Executor's Full Name" value={executor.fullName} onChange={(e) => setExecutor({ ...executor, fullName: e.target.value })} />
                    <FormInput label="Relationship to You" value={executor.relationship} onChange={(e) => setExecutor({ ...executor, relationship: e.target.value })} />
                    <FormInput label="Executor's Full Address" value={executor.address} onChange={(e) => setExecutor({ ...executor, address: e.target.value })} />
                </div>
            )}

            {/* Step 3: Beneficiaries & Assets */}
            {currentStep === 3 && (
                <div>
                     <h3 className="text-xl font-semibold mb-4">Step 3: Beneficiaries & Assets</h3>
                     <div className="space-y-6">
                        {beneficiaries.map((b, bIndex) => (
                             <div key={b.id} className="p-4 bg-gray-700/50 rounded-lg">
                                 <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-white">Beneficiary #{bIndex + 1}</h4>
                                    {beneficiaries.length > 1 && <button onClick={() => removeBeneficiary(b.id)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>}
                                 </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <FormInput label="Full Name" value={b.fullName} onChange={e => handleBeneficiaryChange(b.id, 'fullName', e.target.value)} />
                                    <FormInput label="Relationship to You" value={b.relationship} onChange={e => handleBeneficiaryChange(b.id, 'relationship', e.target.value)} />
                                </div>
                                <h5 className="text-gray-300 mb-2">Assets for this Beneficiary:</h5>
                                <div className="space-y-2">
                                    {b.assets.map((a, aIndex) => (
                                         <div key={a.id} className="flex items-center gap-2">
                                            <input type="text" value={a.description} onChange={e => handleAssetChange(b.id, a.id, e.target.value)} placeholder="e.g., Savings Bank Account, Flat in City" className="flex-1 bg-gray-600 text-white placeholder-gray-400 border border-gray-500 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                            {b.assets.length > 1 && <button onClick={() => removeAsset(b.id, a.id)} className="text-red-400 p-1 rounded-full hover:bg-red-900/50">&times;</button>}
                                         </div>
                                    ))}
                                </div>
                                <button onClick={() => addAsset(b.id)} className="text-green-400 hover:text-green-300 text-sm mt-2">+ Add another asset</button>
                             </div>
                        ))}
                     </div>
                     <button onClick={addBeneficiary} className="mt-4 bg-green-600/50 hover:bg-green-600/80 text-white font-bold py-2 px-4 rounded-lg w-full">+ Add Beneficiary</button>
                </div>
            )}
            
             {/* Step 4: Guardian */}
            {currentStep === 4 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Step 4: Appoint a Guardian (Optional)</h3>
                     <p className="text-gray-400">If you have minor children, you can appoint a guardian for them.</p>
                    <FormInput label="Guardian's Full Name" value={guardian.fullName} onChange={(e) => setGuardian({ ...guardian, fullName: e.target.value })} />
                    <FormInput label="Relationship to You" value={guardian.relationship} onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value })} />
                </div>
            )}

            {/* Step 5: Review & Download */}
            {currentStep === 5 && (
                 <div>
                    <h3 className="text-xl font-semibold mb-4">Step 5: Review and Download</h3>
                    <div className="space-y-4 text-gray-300 p-4 bg-gray-700/50 rounded-lg">
                        <p><strong>Your Name:</strong> {personalInfo.fullName}</p>
                        <p><strong>Executor:</strong> {executor.fullName} ({executor.relationship})</p>
                        <div>
                             <strong>Beneficiaries:</strong>
                             <ul className="list-disc list-inside ml-4">
                                {beneficiaries.map(b => (
                                    <li key={b.id}>{b.fullName} ({b.relationship}) will receive {b.assets.length} asset(s).</li>
                                ))}
                            </ul>
                        </div>
                        {guardian.fullName && <p><strong>Guardian for Minors:</strong> {guardian.fullName} ({guardian.relationship})</p>}
                    </div>
                     <p className="text-gray-400 mt-4 text-sm">Please review the information carefully. Once you're ready, download your will. You will need to print it and have it signed by two witnesses according to legal requirements in your jurisdiction.</p>
                     <button onClick={handleDownload} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full text-lg">
                        Download Will
                    </button>
                </div>
            )}


            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={nextStep}
                    disabled={currentStep === 5}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};