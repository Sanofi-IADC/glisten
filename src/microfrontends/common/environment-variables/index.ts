const getEnvVariablesRuntimeByElement = (id: string) => {
  const runtimeEnvMeta = document.querySelector(id);
  const runtimeEnvRaw = runtimeEnvMeta?.textContent ?? '{}';
  return JSON.parse(runtimeEnvRaw);
};

const runtimeEnvironmentVariables = () => {
  const runtimeEnv = getEnvVariablesRuntimeByElement('#__RUNTIME_ENV__');
  return { ...runtimeEnv, ...process.env };
};

export default runtimeEnvironmentVariables;
