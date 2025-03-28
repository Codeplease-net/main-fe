export type Language = "en" | "vi" | "zh-CN";

export interface MultiLangText {
  en: string;
  vi: string;
  "zh-CN": string;
}

export interface Problem {
  id: string | null;
  displayTitle: string;
  categories: string[];
  difficulty: number;
  searchableTitle?: string[];
  content: {
    title: MultiLangText;
    description: MultiLangText;
    solution: MultiLangText;
  };
  owner: string;
}

export interface ProblemState {
  isLoading: boolean;
  isDone: boolean;
}

// Default title template
export const defaultTitleText: MultiLangText = {
  en: "Problem Title",
  vi: "Tiêu Đề Bài Toán",
  "zh-CN": "问题标题",
};

// Default description template with well-structured sections
export const defaultDescriptionText: MultiLangText = {
  en: `[Describe the problem statement here]

##### Input

[Explain the input here]

##### Output

[Explain the expected output here]

##### Example:

\\begin{example}
...
\`\`\`        
...
\\end{example}

##### Note

[Additional notes or explanations if needed]

Source: \\href{Link}{Problem Name - Source}`,
  vi: `[Mô tả bài toán ở đây]

##### Đầu vào

[Giải thích đầu vào ở đây]

##### Đầu ra

[Giải thích đầu ra mong đợi ở đây]

##### Ví dụ:

\\begin{example}
...
\`\`\`        
...
\\end{example}

##### Ghi chú

[Ghi chú hoặc giải thích thêm nếu cần thiết]

Nguồn: \\href{Link}{Tên Bài Toán - Nguồn}`,
  "zh-CN": `[在此处描述问题]

##### 输入

[在此处解释输入]

##### 输出

[在此处解释预期输出]

##### 示例:

\\begin{example}
...
\`\`\`        
...
\\end{example}

##### 注释

[如有需要，添加额外的注释或解释]

来源: \\href{Link}{问题名称 - 来源}`,
};

// Default solution template with approach and complexity analysis
export const defaultSolutionText: MultiLangText = {
  en: `[Explain your solution approach here]

\\begin{detail}
  \\summary Sample Code (C++)

\\begin{cpp}
#include <bits/stdc++.h>

using namespace std;

int main(){
  // Your code here
  return 0;
}
\\end{cpp}
\\end{detail}

##### Note

Source: \\href{Link}{Solution of [Name] by [Source]}`,
  
  vi: `[Giải thích phương pháp giải quyết của bạn ở đây]

\\begin{detail}
  \\summary Mã Mẫu (C++)

\\begin{cpp}
#include <bits/stdc++.h>

using namespace std;

int main(){
  // Mã của bạn ở đây
  return 0;
}
\\end{cpp}
\\end{detail}

##### Ghi chú

Nguồn: \\href{Link}{Lời giải của [Tên] bởi [Nguồn]}`,
  
  "zh-CN": `[在此处解释您的解决方案方法]

\\begin{detail}
  \\summary 示例代码 (C++)

\\begin{cpp}
#include <bits/stdc++.h>

using namespace std;

int main(){
  // 在此处编写您的代码
  return 0;
}
\\end{cpp}
\\end{detail}

##### 备注

来源: \\href{Link}{[姓名]的解答 作者：[来源]}`,
};

// Update the defaultProblem to use these specialized templates
export const defaultProblem: Problem = {
  id: null,
  displayTitle: "",
  categories: [],
  difficulty: 0,
  content: {
    title: defaultTitleText,
    description: defaultDescriptionText,
    solution: defaultSolutionText,
  },
  owner: "",
};

export type ProblemUpdate = Partial<Problem>;
export type ContentUpdate = Partial<Problem["content"]>;