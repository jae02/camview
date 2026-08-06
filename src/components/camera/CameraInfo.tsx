import { CameraProfile } from '@/types';
import RadarChart from '@/components/ui/RadarChart';

interface CameraInfoProps {
  camera: CameraProfile;
}

export default function CameraInfo({ camera }: CameraInfoProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{camera.icon}</div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  camera.category === 'film' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {camera.category === 'film' ? '필름 카메라' : '디지털 카메라'}
                </span>
                <span className="text-sm text-gray-400">{camera.year}</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{camera.name}</h1>
              <p className="text-lg text-gray-400">{camera.brand}</p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-gray-300 leading-relaxed">
              {camera.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">주요 특징</h3>
            <ul className="space-y-2">
              {camera.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-gray-300">
                  <span className="mr-3 text-amber-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-white/5">
          <h3 className="text-lg font-medium text-gray-200 mb-6">필름/센서 특성</h3>
          <RadarChart 
            data={camera.characteristics} 
            color={camera.accentColor} 
          />
        </div>
      </div>
    </div>
  );
}
