
import React from 'react';

const VerificationForm: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
        <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Become a <span className="text-orange-400">Verified Local Expert</span></h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Are you a local expert, storyteller, or passionate historian? Join BharatYatra to connect directly with global travelers and share your unique cultural insights.
          </p>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Direct Earnings</h4>
                <p className="text-slate-400 text-sm">Keep 90% of your earnings. No middle-man commissions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zM7 13a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Formal Infrastructure</h4>
                <p className="text-slate-400 text-sm">Access to booking management, payments, and marketing tools.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 bg-white p-12 md:p-20">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Amit Patel" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">City of Expertise</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g., Lucknow" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                <option>1-3 Years</option>
                <option>3-7 Years</option>
                <option>7+ Years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Upload Identification (Aadhaar/PAN)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-orange-500 transition cursor-pointer">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-slate-500 font-medium">Click to upload or drag and drop</span>
              </div>
            </div>
            <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95">
              Submit Application
            </button>
            <p className="text-center text-slate-400 text-xs mt-4">
              Our team will review your application and respond within 48 hours for verification.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
