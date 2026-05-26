import { Suspense, ComponentType } from "react";

export function Loadable<T extends object>(Component: ComponentType<T>) {
  return function LoadableComponent(props: T) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#1e2761] font-semibold">Loading...</div>
        </div>
      }>
        <Component {...props} />
      </Suspense>
    );
  };
}