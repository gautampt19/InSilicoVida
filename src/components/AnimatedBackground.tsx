/**
 * Ambient gradient mesh background + grain texture overlay.
 * Replaces the old floating-dots animation with a sophisticated, 
 * slowly shifting mesh that gives depth without distraction.
 */
export const AnimatedBackground = () => {
  return (
    <>
      {/* Gradient Mesh — three blurred color blobs that drift */}
      <div className="gradient-mesh" aria-hidden="true">
        <div className="gradient-mesh-extra" />
      </div>

      {/* Grain / noise texture overlay */}
      <div className="grain-overlay" aria-hidden="true" />
    </>
  );
};
