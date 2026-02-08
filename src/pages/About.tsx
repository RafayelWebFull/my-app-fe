import { motion } from 'framer-motion';
import { Award, HeartHandshake, Sparkles, Eye } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Award,
      title: t('quality'),
      description: t('qualityDesc'),
    },
    {
      icon: HeartHandshake,
      title: t('service'),
      description: t('serviceDesc'),
    },
    {
      icon: Sparkles,
      title: t('style'),
      description: t('styleDesc'),
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center"
            >
              <Eye className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6"
            >
              {t('aboutTitle')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {t('aboutText1')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                {/* Decorative glasses */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-24 border-8 border-primary/20 rounded-[100px] relative">
                    <div className="absolute left-1/2 top-1/2 w-12 h-2 bg-primary/20 -translate-y-1/2" />
                  </div>
                </div>
                <div className="absolute top-10 left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {t('aboutTitle')}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  {t('aboutText1')}
                </p>
                <p className="text-lg leading-relaxed">
                  {t('aboutText2')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center mb-16"
          >
            {t('aboutTitle')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
