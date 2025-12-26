
import React, { useState } from 'react';
import { MOCK_GUIDES } from '../constants';
import { Guide } from '../types';

const GuideMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredGuides = MOCK_GUIDES.filter(guide => 
    guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Verified Local Experts</h2>
          <p className="text-slate-500">Every guide is vetted for knowledge, safety, and reliability.</p>
        </div>
        <div className="mt-6 md:mt-0 relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search by city or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition shadow-sm"
          />
          <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition group flex flex-col h-full">
            <div className="relative h-64">
              <img 
                src={guide.imageUrl} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
                alt={guide.name} 
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm">
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span>{guide.rating}</span>
              </div>
              {guide.verified && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white p-1 rounded-full shadow-lg" title="Verified Expert">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-orange-600 uppercase tracking-wide">{guide.location}</span>
                <span className="text-slate-400 text-xs">{guide.languages.join(' • ')}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{guide.name}</h3>
              <p className="text-slate-500 text-sm mb-4 flex-grow">{guide.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {guide.specialty.map(s => (
                  <span key={s} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-tighter">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <div>
                  <span className="text-lg font-bold text-slate-900">₹{guide.pricePerDay}</span>
                  <span className="text-slate-400 text-xs"> / day</span>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition">
                  Book Guide
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideMarketplace;
