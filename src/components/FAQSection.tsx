import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  id: string;
  question: string;
  questionHindi: string;
  answer: string;
  answerHindi: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "What are the visiting hours of Maharshi Mangal Giri Ashram?",
    questionHindi: "महर्षि मंगल गिरि आश्रम के दर्शन का समय क्या है?",
    answer: "The ashram is open daily from 6:00 AM to 8:00 PM. Morning prayers start at 6:30 AM and evening aarti begins at 7:00 PM.",
    answerHindi: "आश्रम प्रतिदिन सुबह 6:00 बजे से शाम 8:00 बजे तक खुला रहता है। सुबह की प्रार्थना 6:30 बजे और संध्या आरती 7:00 बजे शुरू होती है।"
  },
  {
    id: "2",
    question: "What spiritual services are available at the ashram?",
    questionHindi: "आश्रम में कौन सी आध्यात्मिक सेवाएं उपलब्ध हैं?",
    answer: "We offer regular katha and bhajan sessions, yagna and havan ceremonies, spiritual counseling, meditation classes, and community service programs.",
    answerHindi: "हमारे यहाँ नियमित कथा और भजन, यज्ञ और हवन, आध्यात्मिक परामर्श, ध्यान कक्षाएं, और सामुदायिक सेवा कार्यक्रम उपलब्ध हैं।"
  },
  {
    id: "3",
    question: "How can I participate in ashram events?",
    questionHindi: "आश्रम के कार्यक्रमों में कैसे भाग ले सकते हैं?",
    answer: "You can view upcoming events on our website or contact us at +91 9580094376. Most events are open to all devotees and participation is free.",
    answerHindi: "आप हमारी वेबसाइट पर आगामी कार्यक्रम देख सकते हैं या +91 9580094376 पर संपर्क कर सकते हैं। अधिकांश कार्यक्रम सभी भक्तों के लिए खुले हैं और भागीदारी निःशुल्क है।"
  },
  {
    id: "4",
    question: "Is accommodation available at the ashram?",
    questionHindi: "क्या आश्रम में रहने की व्यवस्था है?",
    answer: "Yes, we provide basic accommodation for devotees visiting from distant places. Please contact us in advance to make arrangements.",
    answerHindi: "हाँ, दूर से आने वाले भक्तों के लिए बुनियादी आवास की व्यवस्था है। कृपया पहले से संपर्क करके व्यवस्था कराएं।"
  },
  {
    id: "5",
    question: "How can I contribute to ashram activities?",
    questionHindi: "आश्रम की गतिविधियों में कैसे योगदान दे सकते हैं?",
    answer: "You can contribute through donations, volunteering for events, participating in community service, or helping with ashram maintenance. Contact us to learn about current needs.",
    answerHindi: "आप दान, कार्यक्रमों में स्वयंसेवा, सामुदायिक सेवा में भागीदारी, या आश्रम के रखरखाव में मदद करके योगदान दे सकते हैं। वर्तमान आवश्यकताओं के बारे में जानने के लिए हमसे संपर्क करें।"
  },
  {
    id: "6",
    question: "What is the best way to reach Maharshi Mangal Giri Ashram?",
    questionHindi: "महर्षि मंगल गिरि आश्रम पहुंचने का सबसे अच्छा तरीका क्या है?",
    answer: "The ashram is located in Ahirori, Hardoi, Uttar Pradesh. The nearest railway station is Hardoi, and we are well-connected by road. Contact us for detailed directions.",
    answerHindi: "आश्रम अहिरोरी, हरदोई, उत्तर प्रदेश में स्थित है। निकटतम रेलवे स्टेशन हरदोई है, और हम सड़क मार्ग से अच्छी तरह जुड़े हुए हैं। विस्तृत दिशा-निर्देशों के लिए हमसे संपर्क करें।"
  }
];

const FAQSection = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Schema Markup for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 devanagari">
            अक्सर पूछे जाने वाले प्रश्न
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Frequently Asked Questions
          </p>
          <p className="text-muted-foreground devanagari max-w-2xl mx-auto">
            आश्रम के बारे में आम प्रश्नों के उत्तर यहाँ मिलेंगे
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <CardHeader 
                className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <CardTitle className="text-base md:text-lg devanagari mb-2">
                      {item.questionHindi}
                    </CardTitle>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {item.question}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 shrink-0"
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedItems.has(item.id) && (
                <CardContent className="pt-0 border-t animate-fade-in-up">
                  <div className="pt-4">
                    <p className="devanagari text-muted-foreground mb-3 leading-relaxed">
                      {item.answerHindi}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground devanagari mb-4">
            अधिक जानकारी के लिए संपर्क करें
          </p>
          <Button className="spiritual-gradient border-0" size="lg">
            संपर्क करें
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
