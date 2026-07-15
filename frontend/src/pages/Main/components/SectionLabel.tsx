// 각 섹션의 제목을 표시하는 컴포넌트
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 11,
    fontWeight: 'bold',
    color: '#bbb',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
  }}>
    {children}
  </div>
);

export default SectionLabel;
