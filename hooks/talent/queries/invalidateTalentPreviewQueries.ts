type TalentPreviewQueryClient = {
  invalidateQueries: (filters: { queryKey: readonly unknown[] }) => Promise<unknown>;
};

export async function invalidateTalentPreviewQueries(
  queryClient: TalentPreviewQueryClient,
  profileId: number | string
) {
  const talentId = String(profileId);

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["talents"] }),
    queryClient.invalidateQueries({ queryKey: ["talent", "detail", talentId] }),
  ]);
}
