export default function Footer() {
  return (
    <footer className="w-full border-t mt-16 py-8" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          &copy; 2026 DSLReview. All rights reserved.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          카메라와 사진을 사랑하는 사람들을 위한 공간
        </p>
      </div>
    </footer>
  );
}
