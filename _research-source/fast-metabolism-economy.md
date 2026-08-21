# The Fast Metabolism Economy
## Franchising, Network Expansion, and Store Turnover in China’s Consumer Economy

*Evidence from chain foodservice and freshly made beverages, 2022–2025*

**Keywords:** franchising; chain expansion; gross flows; store turnover; retail restructuring; China; foodservice

---

# Abstract

A chain can finish a year much larger than it began while replacing a substantial share of its store network along the way. Year-end store counts record the first fact and usually hide the second. This study introduces a descriptive Market Metabolism Rate (MMR)—gross physical store openings plus closures divided by average beginning- and end-period store stock—to make that internal movement visible in contemporary Chinese chain foodservice and freshly made beverage systems.

The evidence combines a 2022–2025 canonical roster of 186 chain brands, 26 complete gross-flow observations reconstructed from issuer disclosures, an exploratory franchise-intensity panel, and approximately 8.38 million raw administrative records processed across Beijing, Chengdu, Hangzhou, Shenzhen, and Xi’an. Two pooled views are reported. A conservative core contains five system-year observations from four systems. An expanded final-issuer pool contains 13 system-year observations from eight independent systems and admits near-total franchised-network disclosures when they cover more than 99% of the contemporaneous total network.

The conservative core produces an MMR of 25.2% and net store growth of 17.3%. The expanded final-issuer pool produces 34.5% MMR and 25.5% net growth. Chain-level results show that high metabolism can accompany rapid expansion or closure-heavy contraction. Franchisee transfers also show why contractual turnover and physical store destruction must be separated. In a matched 22-brand sample, franchise intensity has little independent linear association with subsequent growth after initial network size is controlled for (partial r ≈ −0.06).

The administrative audit reaches a second conclusion: license expiry, legal cancellation, revocation, migration, franchisee exit, store transfer, ranking disappearance, and verified physical closure are different events. None of the city bundles jointly satisfies the predeclared requirements for a defensible outlet-survival panel, so Kaplan–Meier, Cox, and accelerated failure-time models are rejected rather than estimated from ambiguous events.

The evidence supports a simple reading of chain expansion: net growth measures where the network ended; gross flows reveal how much of it moved on the way there.

## 1. Introduction

A chain can add thousands of stores in a year while replacing a large part of itself along the way. Guming offers a clean example. It began 2025 with 9,914 stores, opened 4,292, closed 652, and finished with 13,554. The year-end comparison says that the network grew by 3,640 stores, or 36.7%. That number is correct. It is also incomplete. Across the same year, 4,944 store openings and closures passed through a network whose average stock was 11,734. Measured against that average stock, gross store turnover was 42.1%. (Guming Holdings, 2026) The expansion story and the turnover story describe the same company in the same year, yet they reveal different features of its growth.

The distinction matters because most public discussion of chain expansion is framed in stocks and net changes. A brand has 8,000 stores, then 10,000, then 15,000; the intuitive picture is one of accumulation, with new stores being added on top of an inherited base. That picture breaks down as soon as closures are material. Two networks can post the same net increase while experiencing very different amounts of internal replacement. One may add 1,000 stores and close 100. Another may add 2,000 and close 1,100. Both finish 900 stores larger. Only the second has rebuilt a large fraction of its network in the process.

China’s restaurant sector now makes this stock-flow problem difficult to ignore. The China Chain Store & Franchise Association (CCFA) and Meituan reported that roughly 7.47 million restaurant merchants were operating at the end of 2025, almost unchanged from a year earlier, while 3.39 million merchants were marked as having ceased operations during the year. Chain penetration rose to 25%. The distribution of growth was sharply uneven: store counts among chains with three to ten outlets fell 18.5%, while chains with 501 to 1,000 outlets expanded by 32.6%. (CCFA & Meituan, 2026) Those figures do not establish that 3.39 million physical restaurants permanently died. “Marked as ceased operations” is a platform status, and a platform status can reflect a different object from a verified physical closure. The tension is still informative. A nearly stable aggregate stock can coexist with very large measured flows underneath it, while the surviving and expanding organizations are increasingly concentrated in larger chain systems.

Economics has confronted an analogous measurement problem before. Work on gross job creation and destruction showed that small net employment changes can sit on top of large simultaneous flows of job creation and destruction across establishments. Davis and Haltiwanger’s establishment-level research made gross reallocation visible precisely because aggregate net change discarded most of the movement. (Davis & Haltiwanger, 1990, 1992) Retail research later showed that entry, exit, and reallocation were central to the restructuring of U.S. retail in the 1990s. Foster, Haltiwanger, and Krizan found that the displacement of less productive exiting establishments by more productive entrants—especially entrants belonging to large national chains—accounted for virtually all measured labor-productivity growth in the retail sector over the period they studied. (Foster, Haltiwanger, & Krizan, 2006) These literatures do not provide a ready-made measure of “store metabolism,” and their welfare conclusions cannot be transplanted mechanically to contemporary Chinese foodservice. They establish a more basic point: when gross creation and destruction are large, the net change is an insufficient description of the underlying reallocation process.

The same stock-flow logic can be applied to store networks. It defines a **Market Metabolism Rate (MMR)** as the sum of gross store openings and gross store closures divided by the average of beginning- and end-period store stock:

\[
MMR_t = \frac{Openings_t + Closures_t}{(Stock_{t-1}+Stock_t)/2}.
\]

MMR is deliberately descriptive. It does not assign a welfare sign to turnover, and it is not a mortality rate. A high value can arise during aggressive expansion, deliberate pruning, a governance transition, or a stressed contraction. Its purpose is narrower: to measure how much store-level movement occurred inside a network relative to the size of the network that carried that movement. The companion measure remains conventional net growth:

\[
NetGrowth_t = \frac{Openings_t - Closures_t}{Stock_{t-1}}.
\]

Reading the two together makes it possible to distinguish growth in scale from turnover in composition.

Franchising makes this distinction especially important. The franchise literature has long treated franchising as an organizational architecture that can relax managerial constraints, alter incentives, and support expansion. Shane (1996), for example, found a positive relationship between the degree of franchising and the growth and survival of young franchisors. Later work showed that age, initial size, contract structure, ownership mix, and unobserved chain characteristics complicate any simple relationship between franchising and growth. (Kosová & Lafontaine, 2010) The unit of exit also matters. Holmberg and Morgan’s study of more than 800 franchise systems and roughly 250,000 outlets emphasized that franchisee turnover, transfer, and business failure cannot be collapsed into a single event. (Holmberg & Morgan, 2003) That warning is unusually concrete in current Chinese disclosures. ChaPanda reported 1,218 franchisee terminations in 2025, but 735 of those franchisees transferred their stores to other franchisees for continued operation. The franchise relationship ended; the store did not. (Sichuan Baicha Baidao Industrial Co., 2026)

This difference between organizational events and physical outcomes became a central empirical problem during the construction of the present dataset. A food-business license can expire while a location continues under a renewed license. A legal entity can be cancelled while a store is transferred to another operating entity. A franchisee can exit while another franchisee takes over the outlet. A self-operated store can be converted to franchised governance without closing. A brand can disappear from an annual ranking while remaining commercially active. Acquisitions can add thousands of stores to a reported network without those stores being organic openings. Treating all of these as “death” would generate a large dataset and a precise-looking answer to the wrong question.

The empirical design uses distinct layers for distinct questions. The first measures chain dynamics from sources that explicitly report beginning stock, gross openings, gross closures, and ending stock. The second uses administrative data from several Chinese cities to test how far legal and licensing records can support stronger outlet-level interpretations.

The national layer starts with a canonical roster of 186 Chinese chain brands observed across 2022–2025, producing 400 brand-year list-presence observations. Thirty-seven brands appear in all four annual rosters. Year-to-year roster retention is 69% from 2022 to 2023, 75% from 2023 to 2024, and 64% from 2024 to 2025. These transitions measure list composition, not brand mortality. A ranking exit remains a ranking exit throughout the analysis.

The gross-flow layer is smaller and deeper. The final source pass contains 26 chain-period observations for which all four physical-flow fields can be reconstructed from issuer disclosures: beginning stock, openings, closures, and ending stock. Twenty-two are full-year observations; four are half-year observations that are never mechanically annualized. Two full-year observations contain explicit acquisition-related stock breaks and remain outside organic pooled estimates. Parent and child portfolios are also separated so that a Yum China group observation, for example, is never pooled together with the KFC, Pizza Hut, and “Other Brands” rows nested inside it.

Two pooled views are reported. The **conservative core** keeps the narrowest total-network rule: five system-year observations from four systems produce a stock-weighted MMR of **25.2%**, stock-weighted net growth of **17.3%**, and a closure share of 18.3%. A broader **expanded final-issuer pool** uses 13 system-year observations from eight independent systems. It admits final annual-report observations for near-total franchised networks when the reported franchised scope accounts for more than 99% of the contemporaneous total network, while retaining the same full-year, no-acquisition and no-parent/child-double-counting rules. That pool produces an MMR of **34.5%**, net growth of **25.5%**, and a closure share of 17.2%.

Neither estimate is a population rate for Chinese restaurants. The conservative core is useful because its network scopes are maximally comparable.

<!-- FIGURE 1: A growing network can replace a large share of itself -->

The expanded pool is useful because it incorporates a much wider set of final issuer disclosures while retaining final-issuer source quality. Read together, they show that the stock-flow conclusion does not depend on a single admissibility rule: among disclosure-rich chain systems, gross physical turnover remains large relative to network stock even while the networks expand.

The chain-level variation is as important as the pooled numbers. Restricting the descriptive quadrant analysis to 20 full-year observations with complete gross flows and no acquisition break, the median MMR is 29.1%. Seven observations combine above-median metabolism with expansion; nine combine below-median metabolism with expansion; three combine high metabolism with contraction; one combines low metabolism with contraction. A fixed 30% threshold preserves the high/low assignment for 18 of the 20 observations. Guming’s 2025 expansion sits well inside the high-metabolism/high-growth region. Jiumaojiu’s 2025 observation sits on the other side of the growth axis: its network contracted by 20.2% while MMR reached 29.6%. A single label such as “growing chain” or “shrinking chain” therefore discards meaningful information about the intensity of restructuring underneath the direction of net change.

The franchise-intensity results are less dramatic, which is analytically useful. Twenty-two brands can be matched between 2023 franchise intensity and subsequent 2024–2025 store growth. The raw Pearson correlation is 0.069 and the Spearman correlation is 0.335. Brands with franchise shares at or above 90% grow faster on average in the raw group comparison, but the sample is highly unbalanced: 18 of the 22 brands already sit above that 90% threshold. Initial network scale is strongly related to subsequent growth in this matched sample. Once log initial store count is controlled for, the partial correlation between franchise intensity and subsequent growth is approximately **−0.058**. The evidence therefore does not support a stable claim that a higher franchise share, by itself, predicts faster subsequent network expansion. This does not contradict the broader literature showing that franchising can relax growth constraints. It shows that, within this small and highly franchised contemporary Chinese sample, a simple franchise-share measure carries little independent linear signal after scale is accounted for.

The administrative-data layer changes the paper in a different way. More than 8.3 million raw records were processed across the final Beijing, Chengdu, Hangzhou, Shenzhen, and Xi’an workstreams. That figure describes data-engineering volume; it is not a count of unique firms, stores, or exit events. The audits reveal why that distinction matters. Beijing’s food-license file contains 229,708 records with unique license numbers and very high coverage of standard unified social credit codes, but thousands of subjects hold multiple licenses, including repeated licenses at the same exact subject-address pair. Two large subject/inspection exports hit the Excel row ceiling, making population coverage uncertain. Chengdu provides useful active, cancelled, revoked, migration, and branch records, but the downloaded tables land exactly on 5,000- or 1,000-row caps and cover different historical slices. Hangzhou’s five-million-row change-registration corpus falls to 821,187 records after exact deduplication; it lacks readable change dates and readable change-item labels in the released fields, and the observed authority codes do not cover the whole city. Shenzhen, the city originally intended to support outlet survival analysis, provides a 10,000-row food-license sample dominated by issuance events and a separately capped 100,000-row individual-business sample. After deduplication, only 86 of 9,214 license records can be linked to the individual-business sample at high or medium confidence—about 0.93%.

That is where the analysis stops. Kaplan–Meier curves, Cox models, accelerated failure-time models, and same-brand density hazards are not estimated from these downloads. A recent Shenzhen study demonstrates that rigorous outlet survival analysis is possible with a validated longitudinal panel: Wang et al. (2026) track 77,734 restaurants from January 2023 to June 2025 and estimate accelerated failure-time models of locational factors. The present public-data bundle does not reproduce that event-history structure. Running a survival model anyway would turn administrative convenience into false precision.

That failed identification test is part of the paper’s contribution to measurement. It forces the analysis to separate events that are frequently treated as interchangeable in public discussion. The paper distinguishes physical openings and closures from acquisitions, relocations, ownership conversions, franchisee termination with store transfer, legal-entity exit, license events, and ranking exit. One consequence is substantive: the amount of organizational turnover can exceed the amount of physical store destruction. Another is methodological: claims about “closure rates” are only as strong as the event semantics used to construct the numerator.

The resulting picture of chain growth is less tidy than the standard expansion narrative. Store networks do accumulate scale, and some do so very quickly. At the same time, the same networks can close hundreds or thousands of stores, replace operators, convert governance forms, acquire existing networks, and redistribute locations across franchisees. Gross flows make that internal motion visible. They also prevent a common inferential shortcut in which a growing year-end store count is treated as evidence that the underlying network is stable.

High metabolism is not equated with sickness. Retail restructuring can reallocate resources toward more productive or better-matched operators, as the broader reallocation literature shows; it can also reflect excessive entry, poor site selection, weak unit economics, or costly franchisee turnover. Without store-level productivity and welfare data, those mechanisms cannot be separated cleanly here. What can be measured is the intensity of the replacement process and the organizational forms through which it occurs.

That distinction leaves a sharper question for the rest of the paper. The conventional question asks how fast a chain grew. The gross-flow question asks how much of the network had to enter, exit, transfer, or be reorganized while that growth occurred. In an economy where chain penetration is rising and the stock of restaurants can remain almost flat while millions of merchants are marked as closing, the second question is no longer a side note to the first. It is a different description of how expansion happens.


---

## 2. Literature and Conceptual Framework

The central measurement problem in this paper is older than the object being measured. Economic systems are often described with net changes because net changes are compact. Employment rises by 2%. A retail chain adds 1,000 stores. An industry loses 500 firms. The convenience of those statements comes from subtraction: creation and destruction are collapsed into one number. The cost is that the amount of reallocation underneath the net result disappears.

That cost is small when gross flows are small. It becomes consequential when creation and destruction occur simultaneously at high rates. A chain that opens 1,000 stores and closes 100 ends the year in the same net position as a chain that opens 2,000 and closes 1,100. Both add 900 stores. They do not pass through the same organizational year. The second chain has moved much more capital, labor, franchise relationships, leases, equipment, and local demand through the network to arrive at the same net increase.

That distinction sits at the center of the analysis. The Market Metabolism Rate (MMR) defined here is a descriptive measure of gross store openings and closures relative to average network stock. The label and implementation are specific to this study; the accounting intuition is not. Four literatures give that intuition an intellectual home: gross-flow economics, retail restructuring, franchising and organizational growth, and research on turnover and event definition.

### 2.1 Gross flows and the information discarded by net change

The modern gross-flow literature made visible a simple fact that aggregate employment statistics routinely concealed. Davis and Haltiwanger showed that large volumes of job creation and job destruction can occur simultaneously even when net employment changes are modest. In U.S. manufacturing, gross job reallocation was persistently large, and the heterogeneity of establishment-level employment changes could not be inferred from the aggregate total. (Davis & Haltiwanger, 1990) (Davis & Haltiwanger, 1992) The relevance here is methodological rather than mechanical. A store is not a job, and MMR is not a renamed job-reallocation rate. The analogy lies in the accounting structure. When an aggregate stock changes from one period to the next, the net change says where the system finished. It does not say how much creation and destruction occurred on the path between the two stocks.

That distinction matters because the same net result can be produced by different organizational processes. A low-turnover expansion may reflect a stable inherited network with incremental additions. A high-turnover expansion may reflect aggressive opening combined with substantial pruning, replacement, relocation, or operator turnover. A contraction can likewise be slow and inertial or rapid and highly reorganizing. Net growth therefore captures direction and scale change; gross turnover captures the intensity of internal movement.

The gross-flow literature also warns against treating high reallocation as automatically pathological. Reallocation can be the mechanism by which resources move toward more productive or better-matched uses. At the same time, high gross flows can reflect volatility, experimentation, weak matching, or repeated failure. The flow statistic identifies the intensity of movement before assigning a welfare interpretation to it.

The distinction matters here because “metabolism” is intentionally descriptive. It is a way to make the stock-flow gap legible. It is not a claim that a high-turnover chain is healthy, unhealthy, efficient, or inefficient.

### 2.2 Retail restructuring: entry and exit can be the mechanism of structural change

Retail is unusually well suited to a gross-flow perspective because establishments are spatially discrete and organizationally replaceable. Stores open, close, relocate, change ownership, or are absorbed into larger networks. A sector can look stable in aggregate while its establishment composition changes rapidly.

Foster, Haltiwanger, and Krizan’s study of U.S. retail restructuring in the 1990s is the clearest precedent. Using establishment-level data, they found that measured labor-productivity growth in retail was accounted for overwhelmingly by reallocation, especially the displacement of lower-productivity exiting single-unit establishments by more productive entrants associated with large national chains. (Foster, Haltiwanger, & Krizan, 2006) The paper does not imply that all turnover is productivity-enhancing. Its importance for the present study is that entry and exit are part of the structural transformation of retail, not statistical noise around a stable core.

Later work complicates the interpretation in an important way. Foster, Haltiwanger, and Syverson show that market selection can operate on profitability and demand as well as physical productivity. (Foster, Haltiwanger, & Syverson, 2008) A store can exit because it is operationally inefficient, because local demand is weak, because its price position is wrong, because the lease is unfavorable, because the brand changes strategy, or because another organizational form can use the location more profitably. For a study of Chinese chain foodservice, that caution matters. Store turnover can be economically meaningful without being reducible to a single efficiency mechanism.

The long-run rise of national retail chains provides a second bridge. U.S. Census research following retail establishments over several decades finds persistently high entry among both single-unit firms and national chains, but much higher net growth and greater establishment stability among national chains. (Foster et al., 2015) The rise of chains is therefore not simply a story of more entry by large firms. It is also a story about differential exit, survival, and the ability of organizational systems to retain and redeploy establishments.

That observation is close to the organizational question studied here. Contemporary Chinese chains can expand quickly while closing many stores. The relevant object is not just “chain growth.” It is the architecture through which growth absorbs, replaces, or sheds outlets.

### 2.3 Franchising as a growth architecture

Franchising changes the mechanics of expansion because it separates brand-level control from outlet-level capital ownership and management. A chain can scale without financing and directly managing every new outlet itself. That possibility has long motivated research on franchising as a hybrid organizational form.

Shane argues that franchising can relax managerial constraints by shifting some monitoring, capital, and local operating responsibility to franchisees. In his study of young franchisors, greater reliance on franchising is positively associated with growth and survival. (Shane, 1996) The result is important because it identifies a plausible mechanism through which franchising can support rapid network expansion.

Yet the literature does not support a simple monotonic rule that “more franchising means faster growth.” Franchising changes incentives and control at the same time. Lafontaine and Shaw show that mature franchisors tend to maintain firm-specific target levels of company ownership, suggesting that ownership mix is a strategic organizational choice rather than a temporary stage that mechanically converges to full franchising. (Lafontaine & Shaw, 2005) Brand value, monitoring needs, and control problems help shape that target.

Kosová and Lafontaine add another complication: age, size, and chain characteristics materially affect both growth and survival in franchised retail and service industries. (Kosová & Lafontaine, 2010) Growth rates therefore cannot be read independently of initial network scale. A large established chain and a small emerging chain face different expansion arithmetic even if both are highly franchised.

These findings matter directly for the franchise-intensity exercise. The analysis does not ask whether franchising has ever supported firm growth. That is already well established in the literature. It asks a narrower empirical question: in a contemporary matched sample of Chinese chains, does a higher franchise share predict faster subsequent network growth after initial network size is accounted for?

The answer in the present sample is weak. The raw Pearson correlation between franchise intensity and subsequent growth is 0.069; the rank correlation is 0.335. Once log initial store count is controlled for, the partial correlation is approximately −0.058. The sample is small (N=22) and heavily concentrated among highly franchised systems, so it cannot adjudicate the general theory of franchising. It does something more useful: it prevents the paper from turning a plausible organizational mechanism into a predetermined empirical conclusion.

Franchising remains central to the paper because it can increase the speed and modularity with which a network expands. But expansion architecture and observed growth rate are not the same variable.

### 2.4 Turnover is not failure

The unit of exit is one of the most consequential ambiguities in franchise research. A franchise relationship can end while the store remains open. An outlet can be transferred to another franchisee. A company-operated store can be converted to franchise operation. A legal entity can disappear while the commercial location continues under a new operator.

Holmberg and Morgan make this problem explicit in their analysis of more than 800 franchise systems and roughly 250,000 outlets. Their work shows substantial franchisee turnover and emphasizes the need to distinguish transfers from failures. (Holmberg & Morgan, 2003) The distinction sounds technical until it is applied to current Chinese disclosures. ChaPanda reported 1,218 franchisee terminations in 2025, while 735 of those franchisees transferred stores to other franchisees for continued operation. The contractual relationship ended; the physical outlet did not necessarily close.

This is not a minor coding issue. If every franchisee termination were counted as a store death, the failure rate would be mechanically overstated. If every legal cancellation were counted as a physical closure, the same problem would recur at the administrative level. A ranking disappearance creates another false exit if it is interpreted as brand death rather than list-composition change.

The event taxonomy in this paper therefore separates physical, legal, contractual, governance, and visibility events. “Closure” is reserved for a verified physical outlet exit when the source supports that interpretation. Other signals keep their own names.

The city-data work reinforces this discipline. Beijing contains clean food-license identifiers but also thousands of cases in which the same legal subject holds multiple licenses, including repeated licenses at the same exact subject-address pair. Chengdu separates active, cancelled, revoked, migration, and branch records but the downloadable tables are capped and span different historical slices. Hangzhou’s five-million-row change corpus collapses to 821,187 exact-unique records and still lacks readable change dates and readable change-item labels in the released fields. Shenzhen’s downloadable food-license sample is dominated by issuance events and links poorly to the separately capped individual-business sample. These are not interchangeable event histories.

The methodological implication is deliberately conservative: when event semantics do not support an outlet survival panel, a survival model is not estimated.

That decision is sharpened by Wang et al. (2026), who construct a validated longitudinal panel of 77,734 Shenzhen restaurants and estimate accelerated failure-time models of restaurant survival. (Wang et al., 2026) Their study demonstrates what a usable event-history structure looks like. The public-data bundle assembled for this study does not reproduce that structure. The correct comparison therefore leads to rejection of the model, not imitation with weaker labels.

### 2.5 Organizational selection without biological determinism

The language of “metabolism” naturally invites biological interpretation. Organizational ecology provides a disciplined way to use selection language without turning metaphor into evidence.

Hannan and Freeman shift attention from continuous adaptation by individual organizations toward competition and selection across organizational populations. (Hannan & Freeman, 1977) The framework is useful here because chain systems coexist, expand, contract, and disappear within a changing environment. It also helps explain why population-level restructuring may occur even when individual organizations are inert or constrained.

This study uses organizational ecology as a conceptual bridge, not as a literal biological model. A chain with high MMR is not “fitter” because it turns over more stores. A low-MMR chain is not “healthier” because it is stable. The direction of welfare and productivity cannot be inferred from turnover intensity alone.

The same restraint applies to the “creative destruction” intuition. Pe’er and Vertinsky find that exits of older firms can release resources that stimulate local entry, while persistently high exit rates can eventually deter entry. (Pe’er & Vertinsky, 2008) The result is useful because it offers a two-sided interpretation of turnover. Exit can recycle locations, labor, equipment, supplier relationships, and entrepreneurial attention. Repeated failure can also signal that the local opportunity set is poor.

For contemporary chain foodservice, both possibilities are plausible. A closed outlet may release a location that is rapidly occupied by a stronger chain. A failed franchisee may transfer a store to another operator. A brand may prune underperforming units while expanding elsewhere. A network may also open too aggressively and spend future periods correcting weak site selection.

MMR identifies that these adjustments occurred. It does not decide whether they created value.

### 2.6 Where the contribution sits

The surrounding literatures already answer several large questions. Gross-flow economics shows why net aggregates can conceal simultaneous creation and destruction. Retail research shows that entry and exit can drive structural change. Franchising research explains how hybrid ownership can relax expansion constraints while creating its own control and incentive problems. Work on franchise turnover shows why transfers, operator exits, and business failure cannot be treated as one event.

The remaining gap is narrower and more concrete. Public discussion of Chinese chain expansion still relies heavily on year-end store counts and “net new stores,” even though issuer filings increasingly reveal enough information to reconstruct beginning stock, gross openings, gross closures, and ending stock. Once those fields are assembled consistently, the internal movement hidden by net growth becomes measurable.

That is the role of MMR here. It is a transparent descriptive statistic rather than a structural model, and the study pairs it with an unusually strict event taxonomy. When a source identifies a physical closure, the event can enter gross physical turnover. When it identifies a franchisee termination, a legal cancellation, a relocation, or a ranking exit, the label is preserved.

The contribution is therefore partly empirical and partly methodological. The empirical result shows that rapid network growth and substantial internal turnover can coexist. The methodological result shows how quickly that conclusion becomes unreliable when unlike exit events are pooled together.

The wider implications—resource reallocation, concentration, and a possible connection to a more polarized consumer market—come later. They are useful hypotheses because the measured turnover is large. They are not built into the definition of MMR and are not required for the core result to hold.

## 3. Data and Measurement

The empirical design uses three data layers that answer different questions. The national roster panel describes which brands appear repeatedly in annual chain rankings. The issuer-disclosure panel measures physical openings and closures for systems that report enough stock-flow detail to reconstruct them. The city administrative layer tests whether licensing and legal records can support stronger outlet-level interpretations.

The layers are deliberately not forced into a single panel. They observe different units, cover different time windows, and attach different meanings to “entry” and “exit.” Treating them as interchangeable would create more observations at the cost of a less coherent object.

### 3.1 National roster panel

The broadest layer is a canonical roster of Chinese chain brands observed from 2022 through 2025. After name normalization and brand reconciliation, the panel contains 186 canonical brands and 400 brand-year list-presence observations. Thirty-seven brands appear in all four annual rosters.

The roster panel is used for persistence and composition, not for physical outlet survival. A brand that disappears from a ranking is coded as a ranking exit. It is not coded as a dead brand.

This distinction produces six observed lifecycle categories over the four-year window:

- Persistent core: 37 brands
- New 2025 entrant: 32
- Reentry / gapped active: 4
- Active recent: 27
- Dropped after 2024: 36
- Early dropout: 50

Year-to-year roster retention is 69% from 2022 to 2023, 75% from 2023 to 2024, and 64% from 2024 to 2025.

These statistics describe the movement of brands through the ranking universe. They do not identify firm birth, firm death, store opening, or store closure. The roster is therefore used to show that market visibility and list persistence are themselves dynamic, while keeping the unit of observation explicit.

The 2026 TOP300 list is treated as a regime break rather than mechanically appended to the 2022–2025 panel. Its coverage and timing differ from the earlier canonical series. Publication year and operating-data vintage are also kept separate throughout the study because an annual list may primarily describe the preceding operating period.

### 3.2 Issuer-disclosure gross-flow panel

The empirical core is smaller and substantially deeper. It consists of chain-period observations for which beginning stock, gross openings, gross closures, and ending stock can all be recovered from issuer or company disclosures.

The final source pass contains **26 complete gross-flow observations**:

- 22 full-year observations;
- 4 half-year observations;
- 2 full-year observations with explicit acquisition-related stock breaks.

Two full-year observations are recoverable from comparative tables in final 2025 issuer reports that were not available in the earlier extraction. Auntea Jenny’s 2025 annual report contains an all-brand franchised-store flow table for both 2024 and 2025. Busy Ming Group’s 2025 annual report supplies final 2024 and 2025 franchised-store movements, adding a complete 2025 full-year observation and a final-source basis for the 2024 row.

Each observation is checked against the basic stock identity:

\[
Stock_t = Stock_{t-1} + Openings_t - Closures_t + OtherAdjustments_t.
\]

For ordinary organic observations, `OtherAdjustments` should be zero. When it is not, the residual must be explained before the observation can enter an organic pooled estimate.

This audit identifies two acquisition-related breaks. MIXUE Group’s 2025 observation includes a disclosed addition of 1,354 stores from FULU Fresh Beer. Busy Ming’s 2023 observation contains a 2,433-store acquisition addition. In both cases, the residual in the stock identity matches the disclosed acquisition term. Those observations remain useful descriptively but are excluded from organic pooled estimates.

A separate nesting rule prevents double counting. Group-level observations and their child brands are never pooled together in the same statistic. For Yum China, for example, a group observation cannot be combined with KFC, Pizza Hut, and Other Brands observations from the same year.

Half-year observations are never mechanically annualized. They remain period-specific descriptive records.

### 3.3 Conservative core and expanded final-issuer pool

Two admissibility rules are used because one pooled sample cannot solve every scope-comparability problem.

The **conservative core** is the narrowest. An observation enters this pool only when it has final issuer disclosure, a full fiscal year, a total-network or directly comparable top-level system scope, explicit gross physical openings and closures, no acquisition-related stock break, and no parent/child nesting inside the same pooled calculation.

This leaves five system-year observations from four systems: MIXUE Group 2024; Jiumaojiu 2025; Xiabuxiabu Group 2025; and Yum China 2024–2025. Across those five observations, gross openings plus closures equal 19,248; combined average store stock is 76,413; net store change is 12,188; combined beginning stock is 70,319; and closures equal 3,530.

The **expanded final-issuer pool** keeps the full-year, physical-flow, no-acquisition and no-double-counting rules but admits an additional network scope: a franchised-store series can enter when final issuer disclosure shows that franchised stores account for more than 99% of the contemporaneous total network. This is relevant for franchise-dominant systems such as ChaPanda, Auntea Jenny and Busy Ming, where the disclosed franchised-store flow captures virtually the entire operating network.

The expanded pool contains **13 system-year observations from eight independent systems**: Guming 2024–2025; MIXUE Group 2024; ChaPanda 2024–2025; Auntea Jenny 2024–2025; Busy Ming Group 2024–2025; Jiumaojiu 2025; Xiabuxiabu Group 2025; and Yum China 2024–2025.

Across this pool, gross openings plus closures equal 55,753; combined average store stock is 161,556.5; net store change is 36,579; combined beginning stock is 143,267; and closures equal 9,587.

The pooled statistics are constructed from pooled numerators and denominators rather than by averaging chain-level rates. The conservative core remains the headline benchmark because its network scopes are the most uniform. The expanded pool is reported beside it because it uses final issuer evidence, materially increases coverage, and shows how the conclusion behaves when near-total franchised networks are admitted.

### 3.4 Market Metabolism Rate

The principal descriptive statistic is the Market Metabolism Rate:

\[
MMR_t =
\frac{Openings_t + Closures_t}
{(Stock_{t-1}+Stock_t)/2}.
\]

The numerator counts gross physical store flow. The denominator is the average of beginning- and ending-period store stock.

The choice of average stock is deliberate. A beginning-stock denominator can mechanically inflate the rate for rapidly expanding systems because the network carrying the year’s flow becomes much larger over the period. Busy Ming illustrates the issue clearly: using beginning stock would produce extremely high lag-stock turnover rates in its fastest expansion years. Average stock scales the gross flow against a closer approximation of the network’s typical size during the period.

A lag-stock version is retained as a robustness statistic:

\[
MMR^{lag}_t =
\frac{Openings_t + Closures_t}
{Stock_{t-1}}.
\]

It is not the headline measure.

MMR is a turnover-intensity measure. It is not:

- a store mortality rate;
- a failure probability;
- a survival probability;
- a welfare measure;
- a measure of unique stores ever operated;
- a claim that all closures represent failed businesses.

The word “metabolism” is a descriptive metaphor for gross internal replacement. The measure itself is an accounting ratio.

### 3.5 Net growth and closure share

The companion net-growth statistic is:

\[
NetGrowth_t =
\frac{Openings_t - Closures_t}
{Stock_{t-1}}.
\]

Net growth measures the change in network scale relative to beginning stock. MMR and net growth therefore answer different questions.

A third statistic is the closure share of gross store flow:

\[
ClosureShare_t =
\frac{Closures_t}
{Openings_t + Closures_t}.
\]

For the conservative core:

\[
Weighted\ MMR = \frac{19{,}248}{76{,}413} = 25.1894\%.
\]

\[
Weighted\ NetGrowth = \frac{12{,}188}{70{,}319} = 17.3324\%.
\]

\[
ClosureShare = \frac{3{,}530}{19{,}248} = 18.3396\%.
\]

For the expanded final-issuer pool:

\[
Weighted\ MMR = \frac{55{,}753}{161{,}556.5} = 34.5099\%.
\]

\[
Weighted\ NetGrowth = \frac{36{,}579}{143{,}267} = 25.5320\%.
\]

\[
ClosureShare = \frac{9{,}587}{55{,}753} = 17.1955\%.
\]

The manuscript reports these as **25.2%, 17.3%, and 18.3%** for the conservative core and **34.5%, 25.5%, and 17.2%** for the expanded final-issuer pool.

The difference between the two pools is a scope sensitivity, not a confidence interval. The expanded estimate rises because it admits more franchise-dominant, fast-scaling systems whose final issuer reports now provide comparable full-year gross flows.

### 3.6 Chain-level example: Guming 2025

Guming provides the cleanest illustration of the stock-flow distinction.

The company began 2025 with 9,914 stores, opened 4,292, closed 652, and ended with 13,554:

\[
9{,}914 + 4{,}292 - 652 = 13{,}554.
\]

Average stock is:

\[
(9{,}914 + 13{,}554)/2 = 11{,}734.
\]

MMR is therefore:

\[
(4{,}292 + 652)/11{,}734 = 42.1\%.
\]

Net growth is:

\[
(4{,}292 - 652)/9{,}914 = 36.7\%.
\]

Both numbers are correct. The second says the system ended 36.7% larger than it began. The first says gross store movement during the year was equivalent to 42.1% of average network stock.

The example is useful precisely because a growing chain can exhibit high turnover without the two facts being contradictory.

<!-- FIGURE 2: What net growth leaves out — Guming 2025 -->

### 3.7 Metabolism quadrants

To describe heterogeneity across comparable observations, full-year no-acquisition gross-flow records are placed in a two-dimensional space defined by net growth and MMR.

The updated quadrant analysis uses **20 full-year observations** with no acquisition stock break. This broad descriptive universe can display parent and child observations as separate points because the purpose is to visualize chain-year states rather than pool them into one numerator. It also retains Busy Ming 2022 from issuer listing documentation as a descriptive observation; that row is not part of the expanded final-issuer pooled estimate.

The vertical boundary is zero net growth. The horizontal high/low metabolism boundary is the sample median MMR:

\[
Median(MMR) = 29.1\%.
\]

This yields seven high-metabolism expansion observations, nine low-metabolism expansion observations, three high-metabolism contraction observations, and one low-metabolism contraction observation.

The classification is a descriptive device, not a structural model. A robustness check replaces the sample median with a fixed 30% threshold. Eighteen of 20 observations retain the same high/low assignment, an agreement rate of **90%**.

The terms rapid scaling, stable expansion, churn-heavy restructuring, and slow contraction describe observed chain-year states. They are not lifecycle ages and do not imply a deterministic path from one state to another.

### 3.8 Franchise intensity

Franchise intensity is defined only when the date and network scope of franchised and total store counts are aligned:

\[
FranchiseIntensity =
\frac{Franchised\ Stores}
{Total\ Stores}.
\]

The association sample matches 22 brands between a 2023 franchise-intensity source and subsequent 2024–2025 store growth.

Because the underlying intensity source is a secondary transcription of CCFA TOP280 information, the exercise is explicitly exploratory.

The diagnostics are:

- Pearson correlation between franchise intensity and growth: 0.069;
- Spearman rank correlation: 0.335;
- Pearson correlation between log initial network size and growth: 0.522;
- partial correlation between franchise intensity and growth controlling log initial size: −0.058.

Eighteen of the 22 observations have franchise shares at or above 90%, making the sample highly concentrated at the upper end of the intensity distribution.

No causal model is estimated from these data. The result is stated narrowly: this matched sample does not provide a stable positive linear relationship between franchise intensity and subsequent network growth once initial size is accounted for.

The analysis does not estimate franchise intensity → MMR because a sufficiently aligned same-scope sample is not available.

### 3.9 Event taxonomy

The most important measurement rule in the study is that organizational events are not collapsed into a single “exit” variable.

The taxonomy distinguishes:

**Physical store events**
- opening;
- verified closure;
- relocation or ambiguous exit.

**Network-composition events**
- acquisition;
- disposal where explicitly reported.

**Governance events**
- company-operated → franchised conversion;
- franchised → company-operated conversion.

**Franchise relationship events**
- franchisee termination;
- franchisee termination with store transfer;
- operator change.

**Legal and licensing events**
- legal-entity cancellation;
- legal-entity revocation;
- license issue;
- license renewal;
- license expiry;
- license cancellation.

**Visibility events**
- ranking entry;
- ranking exit;
- ranking reentry.

The same physical location may generate several of these events without closing.

ChaPanda illustrates the problem. In 2025, 1,218 franchisees terminated their relationship with the system; 735 transferred stores to other franchisees for continued operation. Franchisee turnover therefore exceeds physical store destruction.

Jiumaojiu provides a governance example. Eleven Tai Er self-operated stores were converted to franchised operation in 2025. Those conversions change governance form but do not represent physical closures.

Haidilao’s 2024 disclosure combines “closed or relocated” stores. Because the source itself does not separate the two events, the observation is coded as an ambiguous exit event rather than forced into the physical-closure numerator.

MIXUE 2025 shows the acquisition problem: 1,354 stores entered reported network stock through acquisition rather than organic opening.

These distinctions are retained even when doing so reduces the usable sample.

### 3.10 Administrative measurement layer

The administrative data layer was originally intended to support an outlet-level survival extension. It ultimately serves a different and still valuable purpose: testing the semantics and practical limitations of public administrative records.

Across Beijing, Chengdu, Hangzhou, Shenzhen, and Xi’an, approximately 8,383,448 raw administrative rows were processed.

That figure is a data-engineering volume. It is not a count of unique businesses, unique outlets, or unique events.

#### Beijing

Beijing provides the strongest food-license table in the city layer.

The food-license file contains 229,708 records and 229,708 unique license numbers. Standard 18-character unified social credit codes are present in 229,465 rows.

Yet a license record is not automatically an outlet observation. Among valid-USCC subjects, 13,878 hold at least two license IDs, 4,458 appear at two or more exact raw addresses, and 10,260 exact subject-address pairs have at least two license IDs. These patterns are consistent with renewals, multiple permits, historical license records, and multi-location subjects.

Two large Beijing downloads reach 1,048,575 data rows, the Excel worksheet ceiling, and are treated as partial exports. Two other subject tables contain exactly 10,000 rows and are likewise treated as capped partial exports.

Beijing is retained for measurement analysis rather than outlet survival. Its license identifiers and subject keys are strong; the downloaded entity coverage and renewal semantics are insufficient for a clean event history.

#### Chengdu

The Chengdu bundle contains seven official legacy `.xls` files covering active, cancelled, and revoked individual businesses; active domestic enterprises; branch records; migration-out records; and migration-in records.

Four core subject-status files contain exactly 5,000 rows. The three event files contain exactly 1,000 rows. The date windows also differ substantially, indicating capped historical slices rather than a population frame.

Within the downloaded samples, valid unified social credit codes are strong for active individual businesses and active domestic enterprises, but nearly absent from the older revoked file.

Migration IDs are unique within the 1,000-row downloads, and matched migration-in/out records show very short administrative timing gaps. Those records are useful for understanding migration semantics, but they cannot be interpreted mechanically as physical store relocation dates.

Chengdu is retained for subject- and event-semantic analysis, but not for outlet survival estimation.

#### Hangzhou

Hangzhou produced the largest raw administrative workload.

The change-registration corpus contains five million raw rows across four batches. Exact deduplication reduces that corpus to 821,187 unique records. The raw duplicate share is 83.58%.

The deduplicated change corpus still cannot be used as a timed event history because the released fields lack a readable change date and readable change-item labels. Of 821,187 exact-unique rows, 663,668 contain a valid 18-character unified social credit code, supporting subject identification. The final subject index identifies 102,768 covered legal subjects.

Authority codes show that the change corpus covers only the current Shangcheng authority and the historical Jianggan authority code rather than the whole city. Citywide change rates and district comparisons are therefore prohibited.

Other Hangzhou files have their own cohort structures:
- 182,873 individual-business records form a 2024 registration cohort rather than a current stock;
- the annual-report package contains exactly 500,000 rows and is treated as truncated;
- 58,316 website/shop records provide weak auxiliary digital-presence evidence;
- 54,343 food-license records form a 2025 issuance cohort rather than current outlet stock.

Hangzhou is retained as identity and partial change evidence.

#### Shenzhen

Shenzhen was the intended pilot city for outlet survival analysis.

The final downloaded bundle contains 100,000 individual-business records and 10,000 food-license records. After license deduplication, 9,214 license records remain.

The license sample is dominated by issuance events and does not provide a longitudinal sequence of issue, renewal, change, cancellation, and verified physical exit. High- or medium-confidence linkage from the deduplicated license sample to the separately capped individual-business file succeeds for only 86 records, about 0.93%.

The strong-key and event-history requirements therefore fail. Shenzhen therefore does not enter outlet survival estimation.

#### Xi’an

The Xi’an evidence consists of narrow monthly High-Tech Zone files rather than a citywide longitudinal dataset. The processed October 2025 food-business and small-catering files contain 388 rows in total.

They are used only as supplementary examples of local licensing structure. Xi’an does not enter citywide inference.

### 3.11 Rejected survival branch

Outlet-level survival analysis was made conditional on five predeclared data requirements:

- stable license identifier coverage;
- strong entity linkage;
- renewal-versus-new classification;
- address normalization;
- verified exit semantics.

The final public-data bundle does not jointly satisfy those requirements.

Accordingly, the paper does not estimate:

- Kaplan–Meier survival curves;
- Cox proportional-hazard models;
- accelerated failure-time models;
- local same-brand density hazards;
- spatial cannibalization effects.

This rejection is part of the empirical design. It prevents administrative convenience from being mistaken for event identification.

The existence of a recent Shenzhen AFT study based on 77,734 restaurants reinforces the distinction: outlet survival analysis is feasible when a validated longitudinal panel exists. The downloaded public-data files used here do not supply the same event-history structure.

### 3.12 Identification and interpretation

The design is primarily descriptive; it does not identify causal effects of franchising, turnover, or closure.

The main identifying discipline comes from source and event restrictions:

- final issuer disclosures are separated from draft issuer material;
- physical openings and closures are separated from acquisitions and governance conversions;
- group observations are separated from nested child-brand observations;
- full-year and half-year observations are not mixed mechanically;
- ranking exits remain ranking exits;
- legal and license events keep their administrative meaning;
- city datasets that hit export caps are not used as population denominators.

The conservative-core MMR is therefore interpretable as a stock-weighted descriptive statistic for a disclosure-rich sample of large chain systems. The expanded final-issuer result is a wider scope sensitivity. Neither is a population estimate for Chinese restaurants.

The sample is selected on observability: chains enter the gross-flow analysis because they disclose enough information to reconstruct gross flows. This creates an important external-validity limit. Disclosure-rich listed or filing-stage systems are likely to differ from small independent operators and from chains that do not disclose detailed network flows.

Accordingly, neither 25.2% nor 34.5% should be read as a population turnover rate for Chinese restaurants.

The claim supported by the data is narrower:

> Among the conservative core of chain systems with comparable final issuer disclosures, gross store openings and closures equal approximately one quarter of combined average network stock, while net network growth is approximately 17%. A wider final-issuer pool produces a higher turnover level without changing the stock-flow conclusion.

That is enough to establish the paper’s central measurement point. Net growth captures the change in scale. It does not capture the amount of organizational movement required to produce that change.

### 3.13 Data architecture at a glance

**Table 1. Empirical layers and their analytical role**

| Layer | Unit | Main N | Analytical role | Use in the paper |
|---|---:|---:|---|---|
| National roster | Brand-year list presence | 400 observations / 186 brands | Persistence and list composition | Descriptive |
| Issuer gross-flow panel | Chain-period | 26 complete observations | Physical opening/closure measurement | Core |
| Conservative core | System-year | 5 observations / 4 systems | Narrow pooled MMR benchmark | Core |
| Expanded final-issuer pool | System-year | 13 observations / 8 systems | Wider final-issuer pooled estimate | Core sensitivity |
| Franchise association | Brand | 22 | Exploratory association | Qualified |
| Beijing administrative data | Administrative record | 2.45m raw rows | License and subject semantics | Measurement audit |
| Chengdu administrative data | Administrative record | 23,000 raw rows | Status, migration, and branch semantics | Measurement audit |
| Hangzhou administrative data | Administrative record | 5.80m raw rows | Identity and change-evidence audit | Measurement audit |
| Shenzhen administrative data | Administrative record | 110,000 raw rows | Outlet-survival feasibility test | Rejected for survival modeling |
| Xi’an administrative data | Administrative record | 388 rows | Narrow licensing supplement | Supplementary |

*Note:* Administrative row counts are raw processing volumes, not counts of unique outlets, firms, or exit events.

---

## 4. Empirical Results

The first result is easy to miss because ordinary growth statistics compress it.

Across the conservative core, five system-year observations generate 19,248 gross store openings and closures against combined average network stock of 76,413 stores. The corresponding weighted Market Metabolism Rate is 25.2%. Over the same observations, net store change is 12,188 stores against beginning stock of 70,319, giving weighted net growth of 17.3%.

Those two statistics describe different properties of the same systems. Net growth measures the change in scale between the beginning and end of the period. MMR measures how much physical store flow occurred relative to the network that carried it.

The difference is not a semantic one. Gross store flow exceeds net store change by 7,060 stores in the conservative core. Algebraically, that gap is twice the number of closures because:

\[
(Openings + Closures) - (Openings - Closures) = 2\times Closures.
\]

The conservative core contains 3,530 closures. Those exits disappear from the net-change statistic except through the subtraction that determines the final stock.

This is the empirical core. A growing chain can replace a meaningful share of its network while still reporting strong year-end expansion.

### 4.1 Two pooled views of the same stock-flow problem

The conservative core remains the cleanest benchmark. Across its five system-year observations, 19,248 gross store openings and closures occur against combined average network stock of 76,413. Weighted MMR is 25.2%. Net store change is 12,188 against beginning stock of 70,319, giving weighted net growth of 17.3%.

The expanded final-issuer rule allows a broader comparison without lowering the source standard. The pool contains 13 system-year observations from eight independent systems. It adds Guming, ChaPanda, Auntea Jenny and Busy Ming observations where final issuer reporting provides full-year gross flow and where franchised-store scope is either the reported network or more than 99% of the contemporaneous total network.

**Table 2. Pooled gross-flow results under two admissibility rules**

| Statistic | Conservative core | Expanded final-issuer pool |
|---|---:|---:|
| System-year observations | 5 | 13 |
| Independent systems | 4 | 8 |
| Gross store flow | 19,248 | 55,753 |
| Combined average stock | 76,413 | 161,556.5 |
| Weighted MMR | **25.2%** | **34.5%** |
| Net store change | 12,188 | 36,579 |
| Combined beginning stock | 70,319 | 143,267 |
| Weighted net growth | **17.3%** | **25.5%** |
| Closures | 3,530 | 9,587 |
| Closure share of gross flow | **18.3%** | **17.2%** |

*Source:* Author calculations from final issuer disclosures; observation-level sources and scope rules are listed in Appendix A.

The two estimates should not be treated as rival guesses at a China-wide population parameter. The conservative core maximizes network-scope comparability. The expanded pool accepts a wider but still tightly controlled class of final issuer observations. Its higher MMR is driven by the inclusion of fast-scaling franchise-dominant systems, especially Busy Ming.

The fact that the estimate rises under the wider final-issuer rule strengthens the paper’s qualitative conclusion while making the quantitative boundary clearer. The paper does not need 34.5% to claim that gross turnover matters, and it does not need to hide it to preserve the conservative 25.2% headline.

As an additional check, removing MIXUE Group 2024 from the conservative core leaves four observations with pooled MMR of 20.6%, pooled net growth of 9.9%, and a 27.1% closure share. Even that deliberately thinner comparison retains the central stock-flow pattern: positive net growth can sit beside substantial gross movement.

### 4.2 High metabolism does not mean contraction

The chain-level observations make an important point that the pooled average cannot. High MMR can occur in expansion and contraction alike.

Guming illustrates expansion-driven metabolism. The chain began 2025 with 9,914 stores, opened 4,292, closed 652, and ended with 13,554. Net growth was 36.7%. MMR was 42.1%. A year earlier, Guming’s network produced an MMR of 23.9% and net growth of 10.1%. The move into 2025 therefore reflects a much more intensive expansion regime, not simply a larger ending stock.

MIXUE Group shows a similar pattern at greater scale. In 2024, the network opened 10,555 stores and closed 1,609, moving from 37,516 to 46,462 stores. MMR was 29.0% and net growth 23.8%. The 2025 MIXUE observation is deliberately treated differently: ending stock includes a 1,354-store acquisition addition from FULU Fresh Beer, so the year remains descriptive and outside organic pooled estimates.

Auntea Jenny now provides two full-year comparisons from its final 2025 annual report. In 2024, its all-brand franchised network moved from 7,756 to 9,152 stores through 2,383 openings and 987 closures. MMR was 39.9% and net growth 18.0%. In 2025, the network moved from 9,152 to 11,423 through 3,654 openings and 1,383 closures. MMR rose to 49.0%, while net growth reached 24.8%. The franchised-store series accounted for more than 99% of the total network in both years.

Busy Ming makes expansion-driven metabolism even clearer. Its 2025 annual report provides final comparative flow tables for both 2024 and 2025. The franchised network began 2024 with 6,569 stores, opened 8,083, closed 273, and ended with 14,379. MMR was 79.8% and net growth 118.9%. In 2025, it began with 14,379 franchised stores, opened 7,813, closed 265, and ended with 21,927. MMR was 44.5%, net growth 52.5%, and closures represented only 3.3% of gross flow. Franchised stores accounted for 99.9% of the group’s total store network at both year ends.

These are extreme expansion observations, not collapse. A high MMR can be driven by extraordinary opening volume, by closure-heavy restructuring, or by both. MMR measures intensity before it supplies an interpretation.

<!-- FIGURE 6: Different chains, different internal mechanics -->

*Source for Sections 4.2–4.4:* Author calculations from issuer disclosures listed in Appendix A.

### 4.3 The same MMR can describe very different internal states

ChaPanda provides the opposite lesson. Its MMR falls from 29.3% in 2024 to 24.6% in 2025, while net growth slows from 7.5% to 2.7%. Closures rise as a share of gross flow from 37.6% to 44.6%.

The chain is still expanding in 2025, but the balance of gross flow changes. Opening volume falls from 1,477 to 1,159; closures rise from 890 to 933. A year-end count alone reduces this story to a 226-store net increase. The gross-flow view shows a network in which more than two thousand franchised stores entered or exited during the year while final scale barely changed.

The franchisee data complicate the picture further. ChaPanda reports 1,218 franchisee terminations in 2025. Yet 735 of those franchisees transferred stores to other franchisees for continued operation. Contractual turnover is therefore substantially larger than physical store closure. The system can experience operator churn without the corresponding location disappearing.

At Yum China, the group-level picture is much steadier. MMR is 21.0% in 2024 and 20.0% in 2025. Net growth is 12.0% and 10.4%, respectively. Closure share rises moderately from 23.1% to 25.3%.

The stability at group level masks variation inside the portfolio. KFC China remains in a low-metabolism expansion regime in both years: MMR falls from 18.8% to 17.0%, while net growth stays around 12%. Pizza Hut China is similarly stable at approximately 21.6%–21.9% MMR and 11.9%–12.4% net growth.

Yum China’s Other Brands portfolio looks entirely different. MMR is 42.1% in 2024 and 49.5% in 2025 while net growth is negative in both years, at −1.3% and −8.5%. Closure share rises from 51.5% to 59.0%.

This is precisely why parent and child observations cannot be pooled together. The group is growing. One sub-portfolio is simultaneously undergoing high-turnover contraction. Both facts are true, but they operate at different aggregation levels.

### 4.4 Contraction also comes in different forms

The contraction cases reinforce the two-dimensional interpretation.

Jiumaojiu begins 2025 with 807 restaurants and ends with 644. It opens only 26 and closes 189. MMR is 29.6%, net growth −20.2%, and closures account for 87.9% of gross flow.

This is a high-metabolism contraction: the network is shrinking rapidly and the overwhelming majority of observed flow is exit.

Xiabuxiabu Group contracts more slowly. It begins with 957 restaurants, opens 57, closes 109, and ends with 905. MMR is 17.8%, net growth −5.4%, and closure share is 65.7%.

Both chains contract, but Jiumaojiu is reorganizing at a materially higher gross-flow intensity.

Jiumaojiu also demonstrates why governance events are kept outside the closure count. Eleven Tai Er self-operated restaurants were converted to franchised restaurants during the year. Those restaurants changed organizational form; they did not disappear physically. Counting the conversions as closures would overstate physical exit.

The same rule is applied consistently elsewhere. Haidilao’s 2024 disclosure refers to stores that were “closed or relocated.” Because the source combines the two events, the paper does not force the number into the closure numerator. The decision sacrifices observations rather than manufacturing precision from ambiguous labels.

### 4.5 Growth and metabolism form four observed regimes

The updated full-year, no-acquisition quadrant sample contains **20 observations**. The median MMR is **29.1%**, which is used as the descriptive high/low metabolism threshold. Zero net growth separates expansion from contraction.

**Table 3. Growth–metabolism regimes**

| Regime | Observations |
|---|---:|
| High metabolism + expansion | 7 |
| Low metabolism + expansion | 9 |
| High metabolism + contraction | 3 |
| Low metabolism + contraction | 1 |

*Source:* Author calculations from 20 full-year, no-acquisition gross-flow observations.

Sixteen of the 20 observations are expansion years. The high-metabolism expansion group includes Guming 2025, ChaPanda 2024, Auntea Jenny 2024–2025, and Busy Ming 2022, 2024 and 2025. MIXUE Group 2024, at 29.0% MMR, now sits just below the updated 29.1% median. The lower-metabolism expansion group also includes Guming 2024, ChaPanda 2025, Yum China 2024–2025, KFC China 2024–2025, and Pizza Hut China 2024–2025.

The contraction side remains unchanged in composition. Jiumaojiu 2025 and Yum China’s Other Brands portfolios in 2024 and 2025 form the high-metabolism contraction group. Xiabuxiabu 2025 is the only low-metabolism contraction observation.

A fixed 30% MMR threshold produces the same high/low classification for **18 of 20 observations, or 90%**. Only observations close to the boundary switch sides. The four-regime interpretation therefore does not depend heavily on the exact median cutoff.

The quadrant labels should be read literally. “Rapid scaling” identifies expansion combined with high observed turnover. “Stable expansion” identifies positive growth below the sample median MMR. “Churn-heavy restructuring” identifies contraction with high MMR. “Slow contraction” identifies contraction below the median. They are not stages in a universal lifecycle.

<!-- FIGURE 3: Growth and metabolism are separate dimensions -->

### 4.6 Ranking persistence shows a different kind of turnover

The national ranking panel tracks a different object: visibility and persistence in annual brand lists.

Across 2022–2025, the canonical panel contains 186 brands and 400 brand-year presences. Only 37 brands appear in all four annual rosters.

**Table 4. Observed roster lifecycle, 2022–2025**

| Observed roster pattern | Brands |
|---|---:|
| Persistent core | 37 |
| New 2025 entrant | 32 |
| Reentry / gapped active | 4 |
| Active recent | 27 |
| Dropped after 2024 | 36 |
| Early dropout | 50 |

*Source:* Author calculations from the canonical 2022–2025 brand roster.

Year-to-year retention among brands present in the preceding roster is 69% from 2022 to 2023, 75% from 2023 to 2024, and 64% from 2024 to 2025.

This is a substantial amount of roster movement. It does not tell us that 36 brands “died” after 2024 or that 50 early dropouts ceased operating. A brand can leave the list because its store count falls, the list methodology changes, the category boundary shifts, or another brand displaces it in the ranking.

For the subset with comparable 2024 and 2025 store counts, persistent-core brands show mean growth of approximately 7.7%, compared with approximately 5.5% for active-recent brands. The difference is descriptive and small relative to the heterogeneity within categories.

The more defensible result is modest: the set of brands visible at the top of the market is itself fluid. Rank persistence is another form of turnover, but it cannot substitute for store-level or firm-level survival.

<!-- FIGURE 4: Roster persistence is not brand survival -->

### 4.7 Franchise intensity does not carry an independent growth signal in the matched sample

The franchise-intensity exercise begins with a pattern that looks intuitive.

Among the 22 matched brands, 18 have franchise shares of at least 90%. Their mean subsequent store growth is 10.4%. The four mixed-or-lower franchise systems average 4.3%, a raw difference of 6.1 percentage points.

That comparison is fragile for two reasons. The low-franchise group contains only four observations, and initial network size is itself strongly related to subsequent growth.

The continuous association confirms the weakness of the simple story. Pearson correlation between 2023 franchise intensity and subsequent 2024–2025 store growth is 0.069. The Spearman rank correlation is higher at 0.335, suggesting some monotonic ordering but little linear association.

Initial scale matters much more. The correlation between log initial store count and subsequent growth is 0.522. Franchise intensity is also mildly correlated with log initial size, at 0.224.

Once log initial network size is controlled for, the partial correlation between franchise intensity and subsequent growth is −0.058.

The near-zero partial correlation needs a narrow reading. A partial correlation near zero in a 22-brand selected sample does not show that franchising is irrelevant to expansion. The sample is heavily compressed near the top of the franchise-intensity distribution, and the intensity source is a secondary transcription rather than a harmonized issuer dataset.

What the result does establish is narrower and useful: the data do not support the easy cross-sectional claim that a higher franchise share, by itself, predicts faster subsequent network growth.

Franchising remains an expansion architecture. The observed franchise share is not a sufficient growth statistic.

<!-- FIGURE 5: Franchise intensity and subsequent growth -->

### 4.8 What the results add up to

The chain-year evidence does not resolve into one “healthy” or “unhealthy” expansion pattern. It resolves into several.

Some networks add stores while carrying relatively little closure activity. Others grow at extraordinary speed and still push thousands of stores through the opening/closure cycle. Some portfolios contract slowly. Others contract through heavy pruning. Franchise relationships can turn over without the location disappearing, and a parent group can grow while one of its sub-portfolios shrinks.

That is why the 25.2% and 34.5% pooled MMR estimates matter. Their value is not that either number defines a national benchmark. Their value is that gross store flow is large enough to deserve its own axis.

A year-end store count tells us how large the network became.

Gross-flow reconstruction tells us how much of the network moved while getting there.

## 5. Administrative Evidence: What Counts as a Closure?

The city-data work began with an ambitious empirical goal: build an outlet-level survival panel from public administrative records.

It ended by answering a more basic question first.

What, exactly, does an administrative “exit” describe?

Across Beijing, Chengdu, Hangzhou, Shenzhen, and a narrow Xi’an supplement, the study processed approximately 8.38 million raw administrative records. The volume initially suggests that a large survival panel should be straightforward. In practice, each city exposes a different fragment of the legal and licensing process. License expiry, legal cancellation, revocation, migration, franchisee termination, store transfer, address change, and disappearance from a ranking are all observable events. Only a subset of them identifies physical outlet closure.

The administrative layer therefore becomes evidence about measurement itself.

### 5.1 A closure taxonomy

Nine signals that are often collapsed in ordinary discussion are kept separate:

1. license expiry;
2. license cancellation;
3. legal-entity cancellation;
4. legal-entity revocation;
5. franchisee exit;
6. store transfer;
7. address migration or relocation;
8. ranking disappearance;
9. verified physical store closure.

The first four are administrative or legal events. The next two concern contractual or governance relationships. Address movement is spatial or administrative. Ranking disappearance is a visibility event. Only the final category directly describes the physical outcome of the outlet.

The categories can overlap. A restaurant may close physically and later have its license cancelled. A license may expire before an administrative update. A legal entity may be cancelled while the commercial location continues under another entity. A franchisee can terminate while transferring the store to a new franchisee. A store can relocate without the business disappearing.

The empirical question is therefore not “does the record contain the word exit?” It is “what unit exited, and what event does the source actually identify?”

This distinction determines whether outlet survival analysis is legitimate.

<!-- FIGURE 7: What counts as a closure? -->

### 5.2 Beijing: excellent identifiers, ambiguous outlet histories

Beijing contains the strongest licensing table in the city layer.

The food-operation license file contains 229,708 records and 229,708 unique license numbers. Standard 18-character unified social credit codes appear in 229,465 rows, or 99.9% of the file.

At first glance, those properties look close to ideal for a longitudinal outlet panel. The problem appears when license records are grouped by legal subject and address.

Among valid-USCC subjects:

- 13,878 subjects hold at least two license IDs;
- 2,376 hold at least three;
- one subject appears with as many as 281 license IDs;
- 4,458 subjects appear at two or more exact raw addresses;
- 10,260 exact subject-address pairs contain at least two license IDs;
- one exact subject-address pair contains 281 licenses.

A license row is therefore not equivalent to a store birth.

Repeated licenses at the same legal subject and same address can arise from renewal, replacement, historical permit records, additional permit types, or other administrative processes. Multiple addresses for one subject can reflect multi-location operators. Without a predecessor relationship or a reliable event-type sequence, mechanically treating each issue date as a new outlet would create false openings.

The status field presents a second temptation. The file includes:

- 122,714 records coded active;
- 65,951 expired;
- 40,612 cancelled;
- 431 unresolved status-90 records.

Expired and cancelled are meaningful administrative states. They are not exact physical closure dates.

The subject layer does not solve the problem because the downloaded exports are themselves partial. The individual-business and enterprise-registration files each contain exactly 10,000 records. The enterprise business-information file contains 1,048,575 records, exactly the maximum number of data rows that fit below an Excel header. The supervision-inspection file also contains 1,048,575 records.

Those ceilings make the entity tables unsuitable as Beijing-wide denominators.

Exact-USCC linkage illustrates the consequence. Of the valid permit subjects, 10,305 can be matched to at least one of the downloaded subject bases. That low share is not evidence that Beijing’s licensing system fails to identify businesses. It reflects the mismatch between a relatively broad permit file and capped entity exports.

The historical inspection file adds activity evidence but creates another semantic trap. It contains 1,048,575 rows, yet only 9,480 unique USCCs. More than 613,000 rows lack a populated inspection date. Approximately 551,000 rows can be explicitly classified as food-related, while hundreds of thousands concern drugs, medical devices, and other regulatory items.

A row in that file is often an inspection checklist or result item, not an independent inspection event.

Beijing passes the identifier test but not the clean event-history test.

The city is valuable precisely because it shows how a technically excellent license identifier can coexist with an unusable physical-survival timeline.

### 5.3 Beijing’s setup/cancellation anomaly

A smaller Beijing event window provides an even sharper warning.

The domestic-enterprise setup file and cancellation file share 110 unified social credit codes. Every one of the 110 common subjects carries the same setup and cancellation date across the two files.

Taken literally, the records imply 110 firms were established and cancelled on the same day. That is possible in isolated cases. A perfect 110-of-110 pattern strongly suggests that the two files encode event semantics or extraction logic that cannot be treated as a literal business lifetime without further source documentation.

This is the type of anomaly that a survival model can hide rather than solve. A statistical package will happily convert same-day birth and exit into zero-duration spells. The model cannot decide whether the underlying administrative interpretation is correct.

The rule is upstream of the model: event semantics must pass before duration is constructed.

### 5.4 Chengdu: clean status categories, incompatible slices

Chengdu provides a different problem.

The seven official `.xls` files separate active individual businesses, cancelled individual businesses, revoked individual businesses, active domestic enterprises, branch records, migration-out records, and migration-in records.

The status taxonomy is attractive. Cancellation and revocation are separate. Migration is separate from exit. Branch relationships have their own identifiers.

But the downloadable files are visibly capped.

Each of the four major subject-status files contains exactly 5,000 rows. Each of the three event files contains exactly 1,000 rows.

The historical windows also differ:

- active individual-business establishment dates run from 2004 to 2017;
- cancellation dates run from 2008 to 2018;
- revocation dates run from 2011 to 2013;
- active domestic-enterprise establishment dates stretch back to 1980 and end in 2018.

Within those slices, unified social credit codes are strong for the active files and the cancellation file. The revoked sample contains only two valid modern USCC records, consistent with its older vintage.

Cross-status overlap is almost nonexistent. Using exact valid USCC, active, cancelled, and revoked samples do not overlap. Using normalized name plus address produces only one overlap between the cancelled and revoked files.

Those numbers cannot be interpreted as transition probabilities because the files are not synchronized population snapshots. They are different capped slices drawn from different historical windows.

The migration tables are more revealing. All 1,000 migration-in IDs and all 1,000 migration-out IDs are unique within their respective files. There are 353 valid-USCC subjects observed in both directions and 543 overlaps using the broader subject identifier.

Among matched valid-USCC cases, the migration-in date precedes the migration-out date in 341 cases. The median difference between the two dates is only two days; 11 cases occur on the same day.

That timing looks like an administrative transfer process. It would be reckless to call it a physical restaurant move measured to the day.

Chengdu is useful for event taxonomy but not citywide survival estimation.

### 5.5 Hangzhou: five million rows can still fail to identify time

Hangzhou produced the largest and most computationally demanding city dataset.

The change-registration corpus arrived in 100 spreadsheet parts across four large download batches, with exactly five million raw rows. Before any substantive interpretation, the first task was to establish whether those rows were unique observations.

They were not.

Exact raw-record deduplication reduces the five million rows to 821,187 unique records. The remaining 4,178,813 rows are exact duplicates, an 83.58% duplicate share.

The result was independently verified with SHA-256 and BLAKE2 hashes. Both produced exactly 821,187 unique records. The final deduplicated CSV contains the same count. The cleaning result is therefore not an artifact of one hashing implementation.

The duplicate structure is highly systematic. Six hundred thousand records appear in multiple download batches; 580,000 records appear in all four batches. Some exact records appear as many as 16 times in the raw corpus.

This finding changes what “five million records” means. It is a raw delivery volume, not five million businesses and not five million change events.

The cleaned corpus is still large. It contains 663,668 records with valid 18-character unified social credit codes and 102,768 unique valid-USCC subjects.

Yet the two variables required for a conventional change-event history are missing in readable form: a usable change date and a readable change-item label. The before/after content fields are hashes rather than interpretable values.

The records prove that an administrative change record exists for a subject. They do not tell the researcher when the change occurred or what changed in a human-readable way.

Geographic coverage is also narrower than the “Hangzhou” label suggests. The change corpus contains only authority codes 330102 and 330104, corresponding to the current Shangcheng authority and the historical Jianggan authority. The corpus cannot be generalized to Hangzhou citywide change rates.

Linkage to other Hangzhou datasets is weak because the cohorts are built differently.

The 182,873-record individual-business file behaves like a 2024 registration cohort rather than a current stock. Only three records link at high confidence into the change corpus.

The annual-report package contains exactly 500,000 rows and is treated as truncated. It yields 9,070 high exact-name links representing 6,759 unique USCC subjects.

The 58,316 website/shop records produce only 193 high exact-name links.

The 2025 food-license data contain 34,514 individual-business records in the relevant subset. More than 30,000 fall outside the authority coverage of the change corpus. Only one record obtains a high-confidence unique masked-name link.

Hangzhou is therefore a strong identity and data-engineering dataset but a weak timed event-history dataset.

Its final role is identity linkage and partial change evidence.

### 5.6 Shenzhen: the planned survival city fails the identification test

Shenzhen was selected as the original pilot because the public-data portal appeared to offer exactly the layers required for outlet survival: food-operation licenses and business-subject information.

The final downloadable files reveal why availability at the dataset-title level is not enough.

The individual-business file contains exactly 100,000 rows and is treated as a capped download sample.

The food-license file contains exactly 10,000 raw rows. After exact deduplication, 9,214 license records remain.

The event-name field contains only one observed event category:

> food-operation license issuance.

The downloaded license sample therefore does not supply a longitudinal sequence of issuance, renewal, change, cancellation, and verified closure.

The two capped files also link poorly.

Among the 9,214 deduplicated license records:

- 79 obtain a high-confidence unique name-and-address match to the individual-business sample;
- 7 obtain a medium-confidence unique-name match;
- 9,128 do not match.

High- plus medium-confidence linkage is 86 records, approximately 0.93% of the deduplicated license sample.

Among those 86 linked subjects, 60 are marked cancelled in the individual-business sample, 21 active, and five in the “separate register after two years of abnormal listing” status.

Those counts are interesting as examples. They cannot form a representative survival panel because both source files are capped and their cohort relationship is unknown.

Shenzhen therefore fails the predeclared strong-key and event-history requirements.

The final decision is to exclude Shenzhen from outlet-survival estimation.

### 5.7 Xi’an: useful precisely because it remains small

The Xi’an supplement consists of monthly High-Tech Zone files for October 2025.

The small-catering file contains 171 records, all new permits. The second permit file contains 217 records, of which 206 are new and 11 are changes. The combined sample contains 388 rows.

Within these files, license numbers and addresses are well structured. The problem is scope: one district, one month.

Xi’an is therefore not stretched into a citywide result. It remains a local schema example and is coded `SUPPLEMENT ONLY`.

### 5.8 Why 8.38 million rows do not become an 8.38 million-observation model

The final city-data workload is approximately:

| City | Raw administrative rows processed | Final analytical role |
|---|---:|---|
| Beijing | 2,454,528 | License and subject semantics |
| Chengdu | 23,000 | Status, migration, branch semantics |
| Hangzhou | 5,795,532 | Identity and change-evidence audit |
| Shenzhen | 110,000 | Failed store-panel pilot |
| Xi’an | 388 | Narrow supplement |
| **Total** | **8,383,448** | — |

The number is large enough to sound impressive and almost useless if described incorrectly.

It cannot be called 8.38 million stores. Hangzhou alone contains more than four million exact duplicate rows.

It cannot be called 8.38 million businesses. Several files contain multiple records for the same subject, license, checklist item, or administrative event.

It cannot be called 8.38 million exits. Many records are active subjects, inspections, registrations, web-shop records, or duplicated changes.

The correct description is simply:

> approximately 8.38 million raw administrative records processed.

The value of the exercise lies in the audit trail created from them.

### 5.9 The rejected model is a result

The original research plan specified a survival branch conditional on five requirements:

1. stable outlet or license identifiers;
2. strong entity linkage;
3. reliable distinction between new issue and renewal/change;
4. usable address normalization;
5. exit semantics that correspond to physical outlet closure.

No city bundle jointly passes those requirements.

Beijing has strong identifiers but ambiguous repeated licenses and partial entity coverage.

Chengdu has useful status categories but incompatible capped slices and no complete food-license layer.

Hangzhou has enormous scale but no readable change date and no citywide authority coverage.

Shenzhen has the relevant dataset names but only capped samples, issuance-only license events, and sub-1% high/medium linkage.

The paper therefore does not estimate Kaplan–Meier curves, Cox proportional-hazard models, accelerated failure-time models, outlet hazard regressions, or local density/cannibalization effects.

This decision reduces the number of models in the paper. It strengthens the meaning of the models that remain.

A survival curve is only as real as the event that defines death.

### 5.10 Administrative evidence and the meaning of “fast metabolism”

The administrative audit also sharpens the interpretation of MMR.

MMR counts physical openings and closures only when company disclosure supports those events. It does not absorb every legal, contractual, or licensing change into the numerator.

That rule is important because the surrounding commercial system turns over on several layers at once.

A franchise network can replace operators without replacing locations.

A legal subject can disappear while the storefront continues.

A license can expire while the establishment changes permit.

A store can relocate.

A brand can fall out of a ranking.

A physical outlet can close.

All are forms of organizational movement. They are not interchangeable forms of physical destruction.

The “fast metabolism” concept therefore has two levels.

The measured MMR is intentionally narrow: gross physical openings and closures relative to average store stock.

The broader commercial environment contains additional legal, governance, franchise, and visibility turnover that the paper documents qualitatively and administratively but does not force into the MMR statistic.

This separation matters for any later interpretation of the Chinese consumer economy.

If high network turnover eventually proves connected to market concentration, middle-market erosion, or K-shaped consumption, the mechanism will likely involve more than stores literally opening and closing. Capital changes hands. Franchise relationships end. Locations are transferred. Legal entities are replaced. Supply chains and traffic are reallocated.

The administrative audit establishes a measurement foundation for studying those processes.

It keeps administrative signals in their own categories rather than relabeling them as dead stores.

---

## 6. Discussion

The simplest interpretation of the results is also the one most likely to be missed in ordinary growth statistics: a network can become much larger while changing a great deal underneath.

Store counts encourage a cumulative picture. Five thousand stores become eight thousand, then twelve thousand, and the eye imagines a stack getting taller. Gross-flow data replace that picture with a moving system. Stores enter. Stores leave. Operators change. Some locations are transferred. Some parts of a portfolio shrink while the parent keeps expanding.

That movement matters because growth achieved with low turnover and growth achieved with high turnover place different demands on the organization carrying them.

### 6.1 Growth has a composition

The conservative core pairs **17.3% net growth** with **25.2% MMR**. The expanded final-issuer pool pairs **25.5% net growth** with **34.5% MMR**. The levels move when the admissibility rule widens. The stock-flow gap remains.

Net growth answers a scale question: how much larger or smaller was the network at year end? MMR answers a movement question: how much physical opening and closure activity passed through the network during the year?

That second margin carries real economic content. New stores require fit-out capital, equipment, labor, rent commitments, local marketing, franchise investment, and supply-chain capacity. Closures can destroy part of that investment or release it for reuse. A transferred store may keep the physical location but replace the operator. A governance conversion can keep the store while changing who owns or runs it.

The useful question therefore moves beyond “Did the chain grow?” and toward “What kind of growth produced the ending network?”

Guming 2025 is opening-led high-metabolism expansion. Auntea Jenny also expands strongly, with closures taking a larger share of flow. Yum China’s core brands grow at a lower and steadier turnover intensity. Jiumaojiu contracts through closure-heavy restructuring. Yum China’s Other Brands portfolio contracts while the parent group still expands.

A single growth rate compresses all of those states into one number.

### 6.2 Franchising changes the machinery of growth

Franchising remains central even though franchise share itself carries little independent linear signal in the matched 22-brand exercise.

The reason is organizational. Franchising distributes capital, local management, and part of the operating risk across franchisees. That can make a fast build-out feasible. It does not guarantee that a highly franchised chain will grow faster than another highly franchised chain once size, category, demand, site economics, supply-chain reach, and network age enter the picture.

ChaPanda shows an additional adjustment margin. A franchisee can leave while the store continues under another franchisee. In 2025, 1,218 franchisees terminated their relationship with the system, yet 735 transferred stores to other franchisees. Store-count data barely register that contractual churn.

This flexibility may be one reason franchise-heavy systems can reorganize quickly. It may also shift some experimentation cost away from the brand owner and toward local operators. The available data cannot allocate those gains and losses between headquarters and franchisees. That distributional question deserves its own study.

### 6.3 Consumer polarization may determine where released resources go

The chain evidence sits inside a consumer market already showing stronger price segmentation.

Bain and Worldpanel report that urban FMCG spending rose only 0.9% in 2025 even as physical volume increased 3.6%; average selling prices fell 2.6%. (Bain & Company & Worldpanel by Numerator, 2026) NielsenIQ and World Data Lab describe China as a particularly sharp case of middle-market pressure: value tiers gain share across many categories, mainstream price tiers weaken, and premium growth remains selective. (NielsenIQ & World Data Lab, 2026) McKinsey’s consumer survey finds that affluent urban consumers still planned to increase daily spending, especially on quality-of-life and experience categories, despite broader caution. (McKinsey & Company, 2025)

“Consumption downgrade” is too blunt for that pattern. Value seeking is real, but so is selective willingness to pay more. The vulnerable territory lies in the middle, where a product costs more than a value alternative without offering enough differentiation to justify the gap.

Commercial turnover can matter here because an exit releases resources. A closed middle-priced store leaves behind a location, a delivery catchment, nearby labor, supplier relationships, and consumer traffic. A large low-price chain may be able to reuse those resources through procurement scale and standardized operations. A premium operator may support the same location with higher unit economics. A weakly differentiated middle operator has less room to absorb either pressure.

One plausible reallocation sequence is therefore:

1. demand becomes more polarized between value and selective premium;
2. middle-positioned operators lose pricing room;
3. retrenchment releases locations, operators, franchise capital, and local demand;
4. stronger scale systems or sharply differentiated brands absorb part of those resources;
5. market structure becomes more polarized alongside consumer choice.

The current design does not identify that sequence causally. It lacks household-level expenditure linked to the chains in the sample, price-tier migration at store level, and direct tracking of what occupies a location after exit. The mechanism belongs here because it is consistent with both the measured turnover and the external demand evidence.

Restaurant-industry evidence points in the same direction. CCFA and Meituan report that chain penetration reached 25% in 2025; chains with three to ten stores contracted 18.5%, while the 501–1,000-store cohort expanded 32.6%. Roughly 7.47 million restaurant merchants were operating at year end, nearly unchanged from a year earlier, while 3.39 million merchants were *marked as having ceased operations* during the year. (CCFA & Meituan, 2026)

Those platform statuses are not interchangeable with verified physical closures. The broader pattern is still striking: a nearly flat aggregate stock can coexist with enormous internal movement and a redistribution of scale toward larger systems.

### 6.4 Metabolism can be an accelerator without being the direction

Consumer polarization and commercial metabolism describe different things.

Polarization describes where demand is pulling: more weight toward value and selective premium, with pressure in the middle.

Metabolism describes how quickly stores, operators, and relationships move through the commercial system.

A market can polarize slowly. It can also turn over rapidly without developing a stable K-shaped demand pattern. If both processes occur together, high turnover may accelerate the reallocation because resources released by weak operators become available to organizations already positioned at the stronger ends of demand.

That framing avoids a circular story. High MMR does not prove K-shaped consumption. External evidence of consumer polarization does not prove that store turnover caused it. The evidence here identifies one side of a possible mechanism: the intensity of movement.

### 6.5 Bigger and stronger are different questions

A body-composition analogy helps make the measurement problem intuitive.

Someone can gain weight while losing strength. The scale records growth but says nothing about how much of that change is muscle, fat, water, or something more worrying.

A commercial system can fool the eye in a similar way. More stores, more transactions, or more nominal activity tell us that the system is bigger. They do not tell us whether single-store economics improved, whether operators survive longer, whether franchisees earn acceptable returns, or whether progressively more openings are required to produce the same net addition.

The analogy is useful only at that level. Firms are not cells, closures are not necrosis, and MMR is not a medical diagnosis.

A natural next step would be to measure **expansion efficiency**: how many gross openings are required to produce each net additional store, and how that ratio evolves alongside same-store sales and operating profitability. Another extension would link turnover directly to franchisee economics. High turnover could be relatively benign when stores transfer smoothly and capital is preserved; it could be destructive when repeated closures burn fit-out investment and leave operators with unrecovered debt.

Store counts alone cannot separate those cases.

### 6.6 Concentration can rise through repeated replacement

Retail concentration does not require a dramatic merger.

It can also rise gradually if larger networks repeatedly occupy space vacated by smaller operators. The CCFA–Meituan size-cohort pattern is suggestive: the smallest chain group contracted while much larger chain cohorts expanded.

If organizations with stronger procurement, logistics, digital acquisition, data, or access to franchise capital are better able to absorb released locations, repeated local turnover can feed concentration without appearing as a conventional acquisition event.

This mechanism fits the retail-reallocation literature and makes particular sense under strong price competition. Scale lowers some costs and increases the capacity to tolerate failed sites. Those advantages become more valuable when margins are thin.

The present evidence does not estimate a causal effect of turnover on concentration. It shows that turnover is large enough for the channel to be economically plausible.

### 6.7 The failed survival branch is useful evidence

The administrative work also produced a result by refusing to produce a model.

More than eight million raw rows look, at first glance, like an invitation to run sophisticated survival analysis. The audit instead exposed different failures in different cities: repeated licenses and partial subject exports in Beijing; capped historical slices in Chengdu; massive duplication and missing readable event fields in Hangzhou; issuance-only license data and sub-1% high/medium linkage in Shenzhen.

None of those problems disappears when the sample size increases.

A Cox model cannot decide what an ambiguous “death” means. A large N cannot repair a broken unit of observation.

The public-data layer is therefore valuable for a different reason. It shows how administrative systems encode legal, licensing, migration, governance, and inspection processes—and how dangerous it is to relabel those processes as physical store death.

Measurement refusal is part of the evidence here.

### 6.8 Limits

The remaining limits are substantial and easy to state.

First, the pooled MMR samples are selected on disclosure quality and overrepresent large systems with detailed issuer reporting. Independent stores and poorly disclosed private chains sit outside the headline estimates.

Second, the chains span different categories and ownership structures. A beverage franchise and a company-operated restaurant group do not face the same site economics, and the sample remains too small for credible category-specific structural estimation.

Third, the gross-flow observations are system-level. Store age, rent, neighborhood demand, local competition, operator wealth, and store-level profitability are unavailable.

Fourth, the franchise-intensity exercise contains only 22 brands and is heavily concentrated at very high franchise shares. Its near-zero size-adjusted partial correlation is evidence against a simple cross-sectional story, not a universal null result.

Fifth, the consumer-polarization discussion relies on external demand evidence rather than household data linked directly to the chains.

These limits constrain the claims. They leave the stock-flow result intact.

### 6.9 Where this leaves the argument

The evidence supports a narrow claim with wider consequences.

A network can grow rapidly while a large amount of store entry and exit occurs underneath the net increase.

Once that movement is visible, new questions become unavoidable: who finances the openings, who absorbs closure losses, how quickly locations are reused, whether franchise systems transfer stores instead of destroying them, and which organizations are best equipped to absorb repeated local failure.

Those questions move the analysis away from a scoreboard of store counts and toward the process that produces them.

## 7. Conclusion

Chinese chain expansion is usually narrated with an ending count. This study reconstructs the movement underneath that count.

In the conservative core, gross store openings and closures equal **25.2%** of combined average network stock while net growth is **17.3%**. In the expanded final-issuer pool, which admits near-total franchised networks under a >99% coverage rule, MMR rises to **34.5%** and net growth to **25.5%**. The levels differ because the admissibility rules differ. The underlying result is the same: expansion and replacement occur at the same time.

The chain-level evidence shows several forms of that movement. Guming and Auntea Jenny combine rapid expansion with high turnover. Yum China’s core brands expand at lower and steadier MMR. Jiumaojiu contracts through closure-heavy restructuring. A parent group can grow while one of its sub-portfolios shrinks.

Franchising helps explain how fast network expansion can be organized, but franchise share alone carries little independent linear signal in the matched 22-brand sample after initial network size is controlled for. The more useful lesson is organizational: franchise systems can replace operators and contracts without necessarily destroying the physical store.

The city-data audit sharpens that distinction. License expiry, legal cancellation, revocation, migration, franchisee exit, store transfer, ranking disappearance, and physical closure refer to different units and events. More than 8.38 million raw administrative records were processed, yet no city bundle satisfied the full identification requirements for a defensible outlet-survival model. The survival branch was therefore dropped.

That choice matters. Large datasets can create the appearance of precision long before the underlying event is well defined.

The broader consumer context suggests a next research question. Value seeking, selective premiumization, pressure on the middle market, and rising chain penetration may shape where the resources released by commercial exit are reabsorbed. High commercial metabolism could accelerate that reallocation. The present design does not establish the causal link; it establishes that the movement is large enough to warrant measuring.

A year-end store count tells us how large the network became.

Gross flows tell us how much of the network moved to get there.

## 8. Data and Code Availability

The public replication package accompanying the web release contains the derived observation-level data used in the main figures and tables, the pooled-sample definitions, metric formulas, source registry, figure-ready JSON files, and audit outputs for the city-data work.

Raw administrative downloads are not republished as a combined mirror. Their original government-platform files remain part of the private research archive, with file names, checksums, field mappings, and transformation notes preserved for provenance. This keeps the replication package useful without turning it into a redistribution channel for source datasets that may carry platform-specific terms.

The public package therefore supports three forms of verification:

1. recomputation of MMR, net growth, closure share, and the quadrant classification from the released derived data;
2. inspection of the exact issuer sources and scope rules attached to each chain-period observation;
3. reconstruction of every website chart from the same JSON/CSV files used by the paper.

No raw city file is required to reproduce the paper’s headline pooled results.


## References

Auntea Jenny (Shanghai) Industrial Co., Ltd. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www.hkexnews.hk/listedco/listconews/sehk/2026/0428/2026042804495.pdf

Bain & Company, & Worldpanel by Numerator. (2026). *China Shopper Report 2026, Vol. 1*. https://www.bain.cn/news_info.php?id=2141

Busy Ming Group Co., Ltd. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0429/2026042901204.pdf

China Chain Store & Franchise Association (CCFA), & Meituan. (2026). *2026 China Restaurant Chain Development White Paper*. https://www.ccfa.org.cn/portal/cn/xiangxi.jsp?id=447139&ks=2025&type=10003

Davis, S. J., & Haltiwanger, J. (1990). Gross job creation and destruction: Microeconomic evidence and macroeconomic implications. *NBER Macroeconomics Annual, 5*, 123–168. https://doi.org/10.1086/654135

Davis, S. J., & Haltiwanger, J. (1992). Gross job creation, gross job destruction, and employment reallocation. *Quarterly Journal of Economics, 107*(3), 819–863. https://www.nber.org/papers/w3728

Foster, L., Haltiwanger, J., & Krizan, C. J. (2006). Market selection, reallocation, and restructuring in the U.S. retail trade sector in the 1990s. *Review of Economics and Statistics, 88*(4), 748–758. https://doi.org/10.1162/rest.88.4.748

Foster, L., Haltiwanger, J., Klimek, S., Krizan, C. J., & Ohlmacher, S. (2015). *The evolution of national retail chains: How we got here* (CES Working Paper 15-10). U.S. Census Bureau. https://www.census.gov/library/working-papers/2015/adrm/ces-wp-15-10.html

Foster, L., Haltiwanger, J., & Syverson, C. (2008). Reallocation, firm turnover, and efficiency: Selection on productivity or profitability? *American Economic Review, 98*(1), 394–425. https://www.nber.org/papers/w11555

Guming Holdings Limited. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www.hkexnews.hk/listedco/listconews/sehk/2026/0424/2026042401574.pdf

Hannan, M. T., & Freeman, J. (1977). The population ecology of organizations. *American Journal of Sociology, 82*(5), 929–964. https://doi.org/10.1086/226424

Holmberg, S. R., & Morgan, K. B. (2003). Franchise turnover and failure: New research and perspectives. *Journal of Business Venturing, 18*(3), 403–418. https://doi.org/10.1016/S0883-9026(02)00085-X

Jiumaojiu International Holdings Limited. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0429/2026042906101_c.pdf

Kosová, R., & Lafontaine, F. (2010). Survival and growth in retail and service industries: Evidence from franchised chains. *Journal of Industrial Economics, 58*(3), 542–578. https://doi.org/10.1111/j.1467-6451.2010.00431.x

Lafontaine, F., & Shaw, K. L. (2005). Targeting managerial control: Evidence from franchising. *RAND Journal of Economics, 36*(1), 131–150. https://www.gsb.stanford.edu/faculty-research/publications/targeting-managerial-control-evidence-franchising

McKinsey & Company. (2025). Chinese consumption amid the new reality. https://www.mckinsey.com/cn/our-insights/our-insights/chinese-consumption-amid-the-new-reality

MIXUE Group. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0423/2026042301901.pdf

NielsenIQ, & World Data Lab. (2026). *A Tale of Two Consumers: The Polarized Mindsets Reshaping Global Consumption*. https://nielseniq.com/global/en/insights/report/2026/tale-of-two-consumers/

Pe’er, A., & Vertinsky, I. (2008). Firm exits as a determinant of new entry: Is there evidence of local creative destruction? *Journal of Business Venturing, 23*(3), 280–306. https://doi.org/10.1016/j.jbusvent.2007.02.002

Shane, S. A. (1996). Hybrid organizational arrangements and their implications for firm growth and survival: A study of new franchisors. *Academy of Management Journal, 39*(1), 216–234. https://doi.org/10.2307/256637

Sichuan Baicha Baidao Industrial Co., Ltd. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www.hkexnews.hk/listedco/listconews/sehk/2026/0424/2026042402745.pdf

Wang, Z., Li, J., He, X., & Hu, S. (2026). Revisiting the role of location in restaurant survival: Comparison of brick-and-mortar and click-and-mortar outlets in Shenzhen, China. *Applied Geography, 194*, 104116. https://doi.org/10.1016/j.apgeog.2026.104116

Xiabuxiabu Catering Management (China) Holdings Co., Ltd. (2026). *Annual Report 2025*. Hong Kong Exchanges and Clearing Limited. https://www.hkexnews.hk/listedco/listconews/sehk/2026/0416/2026041601791_c.pdf

Yum China Holdings, Inc. (2025). *Fourth Quarter and Full Year 2024 Results* (Exhibit 99.1). U.S. Securities and Exchange Commission. https://www.sec.gov/Archives/edgar/data/1673358/000095017025014954/yumc-ex99_1.htm

Yum China Holdings, Inc. (2026). *Fourth Quarter and Full Year 2025 Results* (Exhibit 99.1). U.S. Securities and Exchange Commission. https://www.sec.gov/Archives/edgar/data/1673358/000119312526036625/yumc-ex99_1.htm

---

## Appendix A. Issuer-disclosure source registry

**Table A1. Core and comparative gross-flow sources**

| System | Period(s) used | Final source | Network scope in analysis |
|---|---|---|---|
| Guming | 2024–2025 | Guming Holdings Limited, *Annual Report 2025* | Reported network |
| MIXUE Group | 2024–2025 | MIXUE Group, *Annual Report 2025* | Group network; 2025 acquisition break excluded from pools |
| ChaPanda | 2024–2025 | Sichuan Baicha Baidao Industrial Co., Ltd., *Annual Report 2025* | Franchised stores; >99% of total network |
| Auntea Jenny | 2024–2025 | Auntea Jenny (Shanghai) Industrial Co., Ltd., *Annual Report 2025* | All-brand franchised stores; >99% of total network |
| Busy Ming Group | 2024–2025 | Busy Ming Group Co., Ltd., *Annual Report 2025* | Franchised stores; 99.9% of total network |
| Jiumaojiu | 2025 | Jiumaojiu International Holdings Limited, *Annual Report 2025* | Total restaurants |
| Xiabuxiabu Group | 2025 | Xiabuxiabu Catering Management (China) Holdings Co., Ltd., *Annual Report 2025* | Total restaurants |
| Yum China | 2024–2025 | Yum China Holdings, Inc., full-year result exhibits | Total restaurants |

The conservative core uses MIXUE Group 2024, Jiumaojiu 2025, Xiabuxiabu 2025, and Yum China 2024–2025. The expanded final-issuer pool adds Guming 2024–2025, ChaPanda 2024–2025, Auntea Jenny 2024–2025, and Busy Ming Group 2024–2025 under the near-total-network rule described in Section 3.3.

Busy Ming 2022 remains available only in the broad descriptive quadrant dataset from issuer listing documentation. It is not part of either final-issuer pooled estimate. Busy Ming 2023 and MIXUE Group 2025 contain acquisition stock breaks and are excluded from organic pooled estimates.

Direct URLs are provided in the References section and preserved with observation-level provenance in the replication package.

## Appendix B. Administrative-data interpretation rules

**Table B1. What common administrative signals establish**

| Observed signal | What it establishes | What it does not establish by itself |
|---|---|---|
| License issue | An administrative permission was issued | Physical store opening |
| License expiry | The license reached its administrative expiry | Physical outlet closure |
| License cancellation | The license was administratively cancelled | Exact physical closure date |
| Entity cancellation | A legal subject exited | Store location ceased trading |
| Entity revocation | A legal status was revoked | Physical closure at the same moment |
| Franchisee termination | A contractual relationship ended | Store closure |
| Store transfer | Operator/control changed | Location exit |
| Address change / migration | Administrative or spatial address changed | Destruction of the commercial outlet |
| Ranking disappearance | Brand left the observed ranking | Brand death |
| Verified physical closure | Outlet ceased operating at the location | — |
