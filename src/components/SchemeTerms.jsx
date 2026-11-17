import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import './SchemeTerms.css';

const TERMS = {
  en: [
    'This is a gold-only scheme with 12 monthly installments. The joining date is installment 1; installments 2–12 are due on the corresponding date in each following month.',
    'Each installment must be submitted within five calendar dates including its due date. Late or missed payments can lead to suspension/cancellation; reactivation and refunds require store review.',
    'After all 12 installments are verified, the making-charge benefit becomes available only on the original 13th-month eligibility date. There is no 13th installment.',
    'Eligible purchases include Gold Jewellery and Gold Coins. The 100% waiver applies to making/labour charges on an eligible purchase, up to the total amount deposited under the scheme.',
    'The gold/product price is not free. Purchase value must not exceed the total verified scheme deposits for this benefit; taxes and other applicable charges may still apply.',
    'Redemption is subject to store verification, product eligibility, scheme status and a valid invoice. The benefit can be redeemed only once per eligible scheme cycle.'
  ],
  hi: [
    'यह केवल सोने की योजना है। इसमें कुल 12 मासिक किस्तें हैं। योजना में शामिल होने की तारीख पहली किस्त की तारीख है और अगली 11 किस्तें अगले महीनों की उसी तारीख को देय होंगी।',
    'हर किस्त देय तारीख सहित पाँच कैलेंडर तारीखों के भीतर जमा करनी होगी। देरी होने पर योजना निलंबित/रद्द हो सकती है; दोबारा चालू करने या रिफंड के लिए दुकान की समीक्षा जरूरी है।',
    'सभी 12 किस्तों का सत्यापन होने के बाद ही मूल निर्धारित 13वें महीने की तारीख से मेकिंग चार्ज में छूट का लाभ मिलेगा। 13वीं किस्त नहीं है।',
    'पात्र सोने के आभूषण और गोल्ड कॉइन पर मेकिंग/मजदूरी चार्ज में 100% छूट मिलेगी। यह लाभ योजना में जमा कुल राशि तक की पात्र खरीदारी पर लागू होगा।',
    'सोना या प्रोडक्ट मुफ्त नहीं है। योजना के लाभ के लिए खरीदारी का मूल्य कुल सत्यापित जमा राशि से अधिक नहीं होना चाहिए। लागू टैक्स और अन्य शुल्क अलग से लग सकते हैं।',
    'लाभ लेने के लिए दुकान द्वारा सत्यापन, पात्र प्रोडक्ट, सही योजना स्थिति और वैध बिल जरूरी है। प्रत्येक पात्र योजना चक्र में लाभ केवल एक बार लिया जा सकता है।'
  ]
};

export default function SchemeTerms({ compact = false }) {
  const [language, setLanguage] = useState('hi');
  return (
    <section className={`rj-scheme-terms ${compact ? 'is-compact' : ''}`}
      aria-label="Scheme terms and conditions">
      <div className="rj-scheme-terms-head">
        <div>
          <p className="rj-scheme-terms-kicker"><ShieldCheck size={16} /> IMPORTANT INFORMATION</p>
          <h2>Terms &amp; Conditions <span>/ नियम एवं शर्तें</span></h2>
        </div>
        <div className="rj-scheme-language" role="group" aria-label="Select terms language">
          <button type="button" className={language === 'hi' ? 'active' : ''}
            aria-pressed={language === 'hi'} onClick={() => setLanguage('hi')}>हिंदी</button>
          <button type="button" className={language === 'en' ? 'active' : ''}
            aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button>
        </div>
      </div>
      <ol lang={language === 'hi' ? 'hi' : 'en'}>
        {TERMS[language].map(term => <li key={term}>{term}</li>)}
      </ol>
    </section>
  );
}
