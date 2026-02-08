import { motion } from 'framer-motion';
import { Award, HeartHandshake, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t('premiumBrands'),
      description: t('qualityDesc'),
    },
    {
      icon: HeartHandshake,
      title: t('expertService'),
      description: t('serviceDesc'),
    },
    {
      icon: Sparkles,
      title: t('modernDesign'),
      description: t('styleDesc'),
    },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
