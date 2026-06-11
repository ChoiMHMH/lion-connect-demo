type TalentPreviewQueryClient = {
  invalidateQueries: (filters: { queryKey: readonly unknown[] }) => Promise<unknown>;
  removeQueries: (filters: { queryKey: readonly unknown[] }) => void;
};

export async function invalidateTalentPreviewQueries(
  queryClient: TalentPreviewQueryClient,
  profileId: number | string
) {
  const talentId = String(profileId);
  const talentQueries = [{ queryKey: ["talents"] }, { queryKey: ["talent", "detail", talentId] }];

  talentQueries.forEach((filters) => {
    queryClient.removeQueries(filters);
  });

  await Promise.all(talentQueries.map((filters) => queryClient.invalidateQueries(filters)));
}
