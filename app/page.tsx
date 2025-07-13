import Link from 'next/link';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Award
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: TrendingUp,
      title: "실시간 수익률 추적",
      description: "매매 기록을 통해 실시간으로 수익률을 계산하고 시각화합니다."
    },
    {
      icon: Target,
      title: "목표 설정 및 관리",
      description: "월간, 연간 목표를 설정하고 달성 진행률을 한눈에 확인하세요."
    },
    {
      icon: BookOpen,
      title: "매매일지 작성",
      description: "상세한 매매 기록으로 트레이딩 패턴을 분석하고 개선하세요."
    },
    {
      icon: BarChart3,
      title: "시각적 차트 분석",
      description: "직관적인 차트로 시드 변화 추이를 쉽게 파악할 수 있습니다."
    },
    {
      icon: Shield,
      title: "안전한 데이터 관리",
      description: "개인 투자 정보를 안전하게 보호하며 언제든 접근 가능합니다."
    },
    {
      icon: Zap,
      title: "빠른 기록 입력",
      description: "간단하고 직관적인 UI로 매매 기록을 신속하게 입력하세요."
    }
  ];

  const benefits = [
    "체계적인 투자 기록 관리",
    "데이터 기반 투자 분석",
    "목표 달성률 시각화",
    "투자 성과 개선"
  ];

  const stats = [
    { number: "99.9%", label: "서비스 안정성" },
    { number: "1,000+", label: "활성 사용자" },
    { number: "4.8/5", label: "사용자 만족도" }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                트레이더를 위한 완벽한 솔루션
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              스마트한 투자,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                정확한 기록
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              매매 기록부터 수익률 분석까지, 당신의 트레이딩을 한 단계 업그레이드하세요. 
              데이터 기반의 투자 분석으로 더 나은 투자 결과를 만들어보세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/journal"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                지금 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                데모 보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                트레이딩을 더 스마트하게
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                전문 트레이더들이 사용하는 필수 기능들을 모두 담았습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-emerald-600 mb-4">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  왜 트레이딩 저널이 필요할까요?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  성공하는 투자자들의 공통점은 체계적인 기록 관리입니다. 
                  감정에 흔들리지 않는 데이터 기반 투자를 시작하세요.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-8 shadow-xl">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">매매 성과</h3>
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">이번 달 수익률</span>
                        <span className="font-semibold text-emerald-600">+15.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">총 수익률</span>
                        <span className="font-semibold text-emerald-600">+127.8%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                        <div className="bg-emerald-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                지금 바로 시작하여 더 나은 투자자가 되어보세요
              </h2>
              <p className="text-xl text-emerald-100 mb-8">
                무료로 시작하고, 언제든지 업그레이드할 수 있습니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/journal"
                  className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-500 mr-2" />
                <span className="text-2xl font-bold">Trading Journal</span>
              </div>
              <p className="text-gray-400 mb-6">
                스마트한 투자를 위한 필수 도구
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-400">
                <Link href="/journal" className="hover:text-white transition-colors">
                  서비스 이용
                </Link>
                <a href="#" className="hover:text-white transition-colors">
                  문의하기
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  개인정보처리방침
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
